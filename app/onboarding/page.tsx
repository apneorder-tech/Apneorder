"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  QrCode, CreditCard, Palette, LayoutGrid, CheckCircle2,
  ArrowRight, ArrowLeft, Phone, Smartphone, Building2,
  Trash2, Plus, Download, Check, Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, onAuthStateChanged } from "firebase/auth";
import { generateQR } from "@/lib/qr";
import { jsPDF } from "jspdf";

type Step =
  | 'phone'
  | 'otp'
  | 'restaurant'
  | 'payment'
  | 'theme'
  | 'menu'
  | 'tables'
  | 'complete';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState({
    phone: '',
    restaurantName: '',
    ownerName: '',
    city: '',
    address: '',
    upiId: '',
    themeColor: '#000000',
    menuCategories: [{ name: 'Coffee', items: [{ name: 'Espresso', price: '120', type: 'veg' }] }],
    tableCount: '10',
    managerId: '',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure manager is synced in DB
        let internalManagerId = user.uid; // Default to UID
        try {
          const idToken = await user.getIdToken();
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          const syncData = await syncRes.json();
          if (syncData.success) {
            internalManagerId = syncData.managerId; // Get the actual ID from DB (could be CUID or UID)
            setData(prev => ({ ...prev, managerId: internalManagerId, phone: user.phoneNumber || "" }));
          }
        } catch (e) {
          console.error("Auth sync error:", e);
        }

        // Check if restaurant already exists
        setIsSyncing(true);
        try {
          const res = await fetch(`/api/onboarding/status?managerId=${internalManagerId}`);
          const status = await res.json();
          if (status.exists && status.restaurant) {
            const r = status.restaurant;
            setData({
              managerId: user.uid,
              phone: user.phoneNumber || "",
              restaurantName: r.name,
              ownerName: r.ownerName,
              city: r.city,
              address: r.address,
              upiId: r.upiId,
              themeColor: r.themeColor,
              menuCategories: r.categories.map((c: any) => ({
                name: c.name,
                items: c.menuItems.map((i: any) => ({
                  name: i.name,
                  price: i.price.toString(),
                  type: i.type
                }))
              })),
              tableCount: r.tables.length.toString()
            });

            // Determine missing steps
            if (!r.name || !r.ownerName) setStep('restaurant');
            else if (!r.upiId) setStep('payment');
            else if (r.categories.length === 0) setStep('menu');
            else if (r.tables.length === 0) setStep('tables');
            else window.location.href = "/dashboard"; // Truly finished
          } else {
            setStep('restaurant');
          }
        } catch (err) {
          console.error("Status Check Error:", err);
          setStep('restaurant');
        } finally {
          setIsSyncing(false);
        }
      } else {
        setStep('phone');
      }
    });
    return () => unsubscribe();
  }, []);

  const nextStep = async (s: Step) => {
    if (s === 'complete') {
      setIsLoading(true);
      try {
        console.log("Saving onboarding data for manager:", data.managerId);
        const res = await fetch('/api/onboarding/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          // Generate a sample QR for table 1
          const url = await generateQR(`${window.location.origin}/menu/${result.restaurantId}?table=1`);
          setQrCodeUrl(url);
          setStep(s);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save your setup. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(s);
    }
  };

  const prevStep = (s: Step) => setStep(s);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const count = parseInt(data.tableCount) || 1;

    for (let i = 1; i <= count; i++) {
      if (i > 1) doc.addPage();

      // Use restaurantId if we have it from the managerId logic or just the managerId for now
      const qrData = `${window.location.origin}/menu/${data.managerId}?table=${i}`;
      const qrImage = await generateQR(qrData);

      doc.setFontSize(28);
      doc.text(data.restaurantName || "Our Restaurant", 105, 40, { align: 'center' });

      doc.setFontSize(18);
      doc.text(`Table No: ${i}`, 105, 60, { align: 'center' });

      doc.addImage(qrImage, 'PNG', 45, 80, 120, 120);

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Scan to Menu • Tap to Pay", 105, 210, { align: 'center' });
      doc.text("Powered by Apne Order", 105, 220, { align: 'center' });
    }

    doc.save(`${data.restaurantName || "Restaurant"}-QR-Codes.pdf`);
  };

  // --- Firebase Auth Logic ---

  useEffect(() => {
    if (!window.recaptchaVerifier && step === 'phone') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          console.log("Recaptcha verified");
        }
      });
    }
  }, [step]);

  const handleSendOTP = async () => {
    if (!data.phone || data.phone.length < 10) return;
    setIsLoading(true);
    try {
      const formattedPhone = data.phone.startsWith('+') ? data.phone : `+91${data.phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setVerificationId(confirmation);
      nextStep('otp');
    } catch (error) {
      console.error("OTP Send Error:", error);
      alert("Failed to send OTP. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6 || !verificationId) return;
    setIsLoading(true);
    try {
      const result = await verificationId.confirm(code);
      const idToken = await result.user.getIdToken();

      // Sync with Supabase via API
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const syncData = await syncRes.json();

      if (syncData.success) {
        setData({ ...data, managerId: syncData.managerId });
        setStep('restaurant');
      } else {
        throw new Error(syncData.error);
      }
    } catch (error) {
      console.error("OTP Verify Error:", error);
      alert("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Functions ---

  const renderPhone = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
          <Phone size={24} />
        </div>
        <CardTitle className="text-2xl font-bold">Sign up with Phone</CardTitle>
        <CardDescription>Enter your mobile number to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mobile Number</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-zinc-400 text-sm font-medium">+91</span>
            <Input
              className="pl-12"
              placeholder="9876543210"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>
        <div id="recaptcha-container"></div>
      </CardContent>
      <CardFooter>
        <Button className="w-full h-12" onClick={handleSendOTP} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Get OTP"} <ArrowRight className="ml-2" size={18} />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderOTP = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
          <Smartphone size={24} />
        </div>
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>We sent a 6-digit code to {data.phone}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              value={digit}
              onChange={(e) => {
                const newOtp = [...otp];
                newOtp[i] = e.target.value;
                setOtp(newOtp);
                if (e.target.value && e.target.nextSibling) {
                  (e.target.nextSibling as HTMLInputElement).focus();
                }
              }}
              className="w-12 h-12 border border-zinc-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-zinc-950 outline-none"
              maxLength={1}
              disabled={isLoading}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full h-12" onClick={handleVerifyOTP} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify & Continue"} <CheckCircle2 className="ml-2" size={18} />
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => prevStep('phone')}>
          Change Phone Number
        </Button>
      </CardFooter>
    </Card>
  );

  const renderRestaurantDetails = () => (
    <Card className="w-full max-w-lg mx-auto shadow-2xl border-zinc-100">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><Building2 size={20} /></div>
          <CardTitle>Restaurant Details</CardTitle>
        </div>
        <CardDescription>Tell us about your café or restaurant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Restaurant/Café Name</label>
            <Input
              placeholder="e.g. The Green Bean"
              value={data.restaurantName}
              onChange={(e) => setData({ ...data, restaurantName: e.target.value })}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Owner/Manager Name</label>
            <Input
              placeholder="Full Name"
              value={data.ownerName}
              onChange={(e) => setData({ ...data, ownerName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input
              placeholder="Select City"
              value={data.city}
              onChange={(e) => setData({ ...data, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address / Landmark</label>
            <Input
              placeholder="Detailed Address"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => prevStep('otp')}><ArrowLeft className="mr-2" size={18} /> Back</Button>
        <Button onClick={() => nextStep('payment')}>Next: Payment Setup <ArrowRight className="ml-2" size={18} /></Button>
      </CardFooter>
    </Card>
  );

  const renderPayment = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><CreditCard size={20} /></div>
          <CardTitle>Payment Setup</CardTitle>
        </div>
        <CardDescription>Add your UPI ID to receive payments directly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="py-8 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
          <Input
            className="w-64 mx-auto text-lg text-center"
            placeholder="username@upi"
            value={data.upiId}
            onChange={(e) => setData({ ...data, upiId: e.target.value })}
          />
          <p className="mt-4 text-xs text-zinc-400">This will be used for all customer payments</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => prevStep('restaurant')}><ArrowLeft className="mr-2" size={18} /> Back</Button>
        <Button onClick={() => nextStep('theme')}>Next: Theme <ArrowRight className="ml-2" size={18} /></Button>
      </CardFooter>
    </Card>
  );

  const renderTheme = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><Palette size={20} /></div>
          <CardTitle>Menu Theme</CardTitle>
        </div>
        <CardDescription>Choose a look that matches your brand</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {['#000000', '#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED'].map((color) => (
          <button
            key={color}
            className={cn(
              "h-20 rounded-xl border-4 transition-all",
              data.themeColor === color ? "border-zinc-900 scale-105" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
            onClick={() => setData({ ...data, themeColor: color })}
          >
            {data.themeColor === color && <Check className="text-white mx-auto shadow-sm" />}
          </button>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => prevStep('payment')}><ArrowLeft className="mr-2" size={18} /> Back</Button>
        <Button onClick={() => nextStep('menu')}>Next: Menu Setup <ArrowRight className="ml-2" size={18} /></Button>
      </CardFooter>
    </Card>
  );

  const renderMenuSetup = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Menu Setup</CardTitle>
          <CardDescription>Create categories and add your food items</CardDescription>
        </div>
        <Button variant="outline" size="sm"><Plus className="mr-2" size={14} /> Add Category</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.menuCategories.map((cat, idx) => (
          <div key={idx} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">{cat.name}</h4>
              <button className="text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
            <div className="space-y-3">
              {cat.items.map((item, iIdx) => (
                <div key={iIdx} className="bg-white p-3 rounded-lg flex items-center justify-between shadow-sm border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", item.type === 'veg' ? 'bg-green-500' : 'bg-red-500')} title={item.type}></div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-bold text-zinc-600">₹{item.price}</span>
                    <button className="text-zinc-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full border-2 border-dashed border-zinc-200 mt-2 h-12">
                <Plus className="mr-2" size={16} /> Add Item
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => prevStep('theme')}><ArrowLeft className="mr-2" size={18} /> Back</Button>
        <Button onClick={() => nextStep('tables')}>Next: Table Setup <ArrowRight className="ml-2" size={18} /></Button>
      </CardFooter>
    </Card>
  );

  const renderTables = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><LayoutGrid size={20} /></div>
          <CardTitle>Table Setup</CardTitle>
        </div>
        <CardDescription>How many tables does your restaurant have?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            className="w-14 h-14 text-2xl"
            onClick={() => setData({ ...data, tableCount: Math.max(1, parseInt(data.tableCount) - 1).toString() })}
          >
            -
          </Button>
          <span className="text-4xl font-extrabold w-20">{data.tableCount}</span>
          <Button
            variant="outline"
            className="w-14 h-14 text-2xl"
            onClick={() => setData({ ...data, tableCount: (parseInt(data.tableCount) + 1).toString() })}
          >
            +
          </Button>
        </div>
        <p className="text-sm text-zinc-400">Individual QR codes will be generated for each table</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => prevStep('menu')}><ArrowLeft className="mr-2" size={18} /> Back</Button>
        <Button onClick={() => nextStep('complete')}>Generate QR Codes <ArrowRight className="ml-2" size={18} /></Button>
      </CardFooter>
    </Card>
  );

  const renderComplete = () => (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-100 text-center overflow-hidden">
      <div className="h-2 bg-zinc-900 w-full" />
      <CardHeader className="pt-10">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} fill="currentColor" className="text-white" />
          <CheckCircle2 size={48} className="absolute" />
        </div>
        <CardTitle className="text-3xl font-extrabold">Setup Complete!</CardTitle>
        <CardDescription className="text-lg">Your restaurant is now ready to take orders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
          <div className="w-32 h-32 bg-white p-2 mx-auto rounded-xl shadow-sm flex items-center justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            ) : (
              <QrCode size={100} strokeWidth={1.5} />
            )}
          </div>
          <p className="font-semibold">{data.restaurantName}</p>
          <p className="text-sm text-zinc-500">{data.tableCount} QR Codes Generated</p>
        </div>
        <Button
          className="w-full h-14 text-lg rounded-xl"
          variant="outline"
          onClick={handleDownloadPDF}
        >
          <Download className="mr-2" size={20} /> Download PDF for Print
        </Button>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard" className="w-full">
          <Button className="w-full h-14 text-lg bg-zinc-900 rounded-xl">
            Go to Dashboard <ArrowRight className="ml-2" size={20} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  if (isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-zinc-900 animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse tracking-wide">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col py-10 px-6">
      <div className="max-w-4xl mx-auto w-full mb-12">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-bold text-zinc-400 tracking-widest uppercase">Manager Onboarding</span>
          <span className="text-sm font-bold text-zinc-900">Step {
            ['phone', 'otp', 'restaurant', 'payment', 'theme', 'menu', 'tables', 'complete'].indexOf(step) + 1
          } of 8</span>
        </div>
        <div className="h-1.5 bg-zinc-200 rounded-full w-full overflow-hidden">
          <motion.div
            className="h-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${((['phone', 'otp', 'restaurant', 'payment', 'theme', 'menu', 'tables', 'complete'].indexOf(step) + 1) / 8) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {step === 'phone' && renderPhone()}
          {step === 'otp' && renderOTP()}
          {step === 'restaurant' && renderRestaurantDetails()}
          {step === 'payment' && renderPayment()}
          {step === 'theme' && renderTheme()}
          {step === 'menu' && renderMenuSetup()}
          {step === 'tables' && renderTables()}
          {step === 'complete' && renderComplete()}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-12 text-center text-sm text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 transition-colors">← Back to Homepage</Link>
      </footer>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
