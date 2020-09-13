# Honey API

## 1. Auth
    1.1 JWT
        JWT use algorithm "HS256" because we will have control on who uses the secret keys.
        But if server will provide an open api, you need to use RS256 (public key + private key).

        Access Token:
            Header = { "ctp": "JWT", "alg": "HS256" }
            Payload = { "userId": "...", "iat": "...", "exp": "..." }

            Expiries - 30m.

            Saved in applicayion memory.
            Send in HTTP Headers - "Authorization Bearer ${token}"

        Refresh Token:
            Header = { "ctp": "JWT", "alg": "HS256" }
            Payload = { "userId": "...", jti": "...", "iat": "...", "exp": "..." }

            Expiries - 7d.

            Send only with csrf-secret in "cookies" and csrf-token in "headers".

            Table: |   tokenId    |     appId    |   userId   |
                   |    uuid      | varchar(128) |    uuid    |

            { jti - unique identifier of the token. }

    1.2 LocalStorage/SessionStorage
        In storage saved "appId" (uuid.v4) in base64 encoding.
        In storage saved csrf-token ( base64("token") + base64("appId") ).

    1.3 Cookies
        "path":
             If you need a certain way set "path".
        "expires/max-age":
            By default if is not set, data deleted after close site.
            Need to set "max-age".

            exp: "max-age" for RefreshToken is token expiries.
        "secure":
            On "production" version need be "true" for sends only with HTTPS.
        "domain":
            The domain on which our cookies are available.
        "sameSite":
            Way to protect against CSRF attacks.
            Cookies with "samesite = strict" will never be sent if the user does not come from the same site.

            "sameSite = lax" a softer variant that also protects against CSRF.
            "lax" mode, like "strict", prevents the browser from sending cookies when the request comes from outside the site.
            SameSite not supported by older browsers (before 2017).
        "httpOnly":
            This setting disallows any access to cookies from JavaScript.
            We cannot see or manipulate such a cookie with document.cookie.
        "signed":
            Indicates if the cookie should be signed.
            For data that is already encrypted / signed (exp: tokens) you do not need to use.
            In all other cases it is recommended to use.

        RefreshToken - {
            "path = /auth/refresh",
            "httpOnly",
            "secure = true",
            "SameSite = lax",
            "max-age = token expiries"
        }

        csrf-token - {
            "httpOnly",
            "signed",
            "secure = true",
            "SameSite = lax",
            "max-age = token expiries"
        }

    1.4 CSRF
        Use only JSON APIs. There is no way for a simple <form> to send JSON, so by accepting only JSON, you eliminate the possibility of the above form.



Links:
- [cookies](https://learn.javascript.ru/cookie#nastroyka-samesite)
- [csrf](https://github.com/pillarjs/understanding-csrf)

**Total:**
> User gets *AccessToken* and *RefreshToken* when authenticated.

> *Tokens* not save in LocalStorage or SessionStorage, because such token
> can be read from JavaScript and therefore it is vulnerable to XSS attack.


## 2. nginx

1. CORS
   > *https://owasp.org/www-community/attacks/csrf*


## Implementation details
 1. The server adheres to the **REST** architecture.
