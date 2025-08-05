declare module 'promptpay-qr' {
  interface PaymentOptions {
    amount?: number
  }

  function generatePayload(
    idOrPhoneNo: string,
    options?: PaymentOptions
  ): string

  export = generatePayload
  export { generatePayload }
}
