/*external modules*/
import cookieParser from "cookie-parser";
/*other*/
import { config } from "../../config";

/**
 *    req.cookies => Cookies that have not been signed
 *    req.signedCookies => Cookies that have been signed
 * */

export default cookieParser(config.secrets.cookieSecret)
