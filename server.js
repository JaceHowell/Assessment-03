import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import nunjucks from 'nunjucks';

const app = express();
const port = '4090';

// Middleware
app.use(morgan('dev'));
// post reqs
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))
app.use(session({
  secret: 'shhhh',
  saveUninitialized: true,
  resave: false
}))
nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.get('/', (req, res) => {
  res.render('index.html')
})
app.get('/callback', (req, res) => {
  res.render('callback.html')
})

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
})