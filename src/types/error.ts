export class AirportFetchError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'AirportFetchError'
  }
}