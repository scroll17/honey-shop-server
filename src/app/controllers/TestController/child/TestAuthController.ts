import { Child, Post } from '../../../core/decorators';

@Child()
export class TestAuthController {
  @Post()
  sign({ req, res }) {
    res.send('--- AUTH ---');
  }
}
