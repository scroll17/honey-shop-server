/*external modules*/
import 'reflect-metadata'
import express from 'express';
/*@core*/
import {ClassMiddleware, Controller} from "../../core/decorators";
import {InjectRoute} from "../../core/decorators/property";
/*handlers*/
import {Init} from "./handlers/init";
/*other*/

@Controller('/auth')
@ClassMiddleware([express.json()])
class AuthController {
  @InjectRoute('post', '/init')
  init!: Init

// login
// logout
// signup
// refresh

}

export default AuthController
