export async function sleep(ms:number) {
    await new Promise(r=>setTimeout(r,ms));
}
export function convertScale (number:number, inMin:number, inMax:number, outMin:number, outMax:number) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}