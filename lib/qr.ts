import QRCode from 'qrcode';

export async function generateQR(text: string): Promise<string> {
    try {
        const url = await QRCode.toDataURL(text);
        return url;
    } catch (err) {
        console.error('QR Generation Error:', err);
        return '';
    }
}
