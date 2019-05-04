# bookshelf-rest-api

Quickly connect Bookshelf models tor 

`npm install bookshelf-rest-api --save`

`yarn add bookshelf-rest-api`

See /example as for how to set it up

-- examples/api.js shows the setup
-- databases/postgres.js is how we set up our postgres models, you should do something similar and then your Model should extend that Bookshelf.Model.

QUICK START

Copy examples/api.js to ./api.js of your project.  Add models.  

```javascript
// In app.js
var app = express();
// somewhere after the above line
require('./api')(app);

```

That's it.  Now you have a CRUD powered app with a full life cycle for its model.

