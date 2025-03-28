# Candidate Takehome Exercise
This is a simple backend engineer take-home test to help assess candidate skills and practices.  We appreciate your interest in Voodoo and have created this exercise as a tool to learn more about how you practice your craft in a realistic environment.  This is a test of your coding ability, but more importantly it is also a test of your overall practices.

If you are a seasoned Node.js developer, the coding portion of this exercise should take no more than 1-2 hours to complete.  Depending on your level of familiarity with Node.js, Express, and Sequelize, it may not be possible to finish in 2 hours, but you should not spend more than 2 hours.  

We value your time, and you should too.  If you reach the 2 hour mark, save your progress and we can discuss what you were able to accomplish. 

The theory portions of this test are more open-ended.  It is up to you how much time you spend addressing these questions.  We recommend spending less than 1 hour.  


For the record, we are not testing to see how much free time you have, so there will be no extra credit for monumental time investments.  We are looking for concise, clear answers that demonstrate domain expertise.

# Project Overview
This project is a simple game database and consists of 2 components.  

The first component is a VueJS UI that communicates with an API and renders data in a simple browser-based UI.

The second component is an Express-based API server that queries and delivers data from an SQLite data source, using the Sequelize ORM.

This code is not necessarily representative of what you would find in a Voodoo production-ready codebase.  However, this type of stack is in regular use at Voodoo.

# Project Setup
You will need to have Node.js, NPM, and git installed locally.  You should not need anything else.

To get started, initialize a local git repo by going into the root of this project and running `git init`.  Then run `git add .` to add all of the relevant files.  Then `git commit` to complete the repo setup.  You will send us this repo as your final product.
  
Next, in a terminal, run `npm install` from the project root to initialize your dependencies.

Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work at Voodoo.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json
- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications at Voodoo will use consume this API.

#### Question 1:
We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

On the API:
- Better error handling: don't return directly errors to the frontend but generate error message on a specific middleware and then return them.
- Validations on other existing endpoints: validate params send by the frontend to the api before inserting games in the database.
- Avoid duplication of games in the database: make sure that if you try to create a game twice then it's blocked by the API to avoid duplication (check publisher id, store id and bundle id for example).
- Use uuid as id in database: don't use incremental primary key id in database to make sure that you can not predict ids (not really on issue on this kind of data but still it's a good practise).
- Add authentication mechanism: add a basic authentication mechanism, at least on the creation and populate routes in order to make sure that only authentified users can create games in database. You probably don't want that every one can update your database.
- Add limit on listing routes: limit the result that the query to the database could return when listing games in order to not return thousands of games if the database grows a lot. Then we would need to implement pagination to do that.
- Add cache on listing routes: as the database is not subject to change a lot every minutes, a cache mechanism on listing routes could improve the performances and reduce the database queries.
- Tests: currently first tests on the test.js file is dependant on the previous test. This is not a good practice, you would prefer to have each test independant. Then if a test need that game is existing in database, I would create the game first directly in database before testing the endpoint and after you need to clean the database state. Then you make sure that each test is independant and that a test can not impact another one (we could miss bugs even if all tests passed).
- Environment file: use env variables for sensitive information (database url, crendentials, etc).

On the infra - CI/CD:
- Add github actions for CI: add a github actions runner to run all tests to before merging a pull request for example.
- Deployment in production: As this is a simple node js application, we could build a docker image for the app and deploy this image on cloud provider service (ECS on AWS for example). We also need to provision a database (Aurora postgre SQL on AWS for example).

#### Question 2:
Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.

As the data team is using S3, I'm considering that we are fully on AWS and that we can use all services that AWS can provide. I would then create an automation on the S3 bucket to directly trigger a lambda function each time there is a new file that is dropped on the bucket. The lambda function would have the key of the dropped file as input and then it will be this lambda that will handle the logic of populating the database. As already answered in the previous question, it will of course check for any existing game in the database before inserting any game. At the end the lambda could notify some users that new games are available in the database, using AWS SNS for example. With this solution we can remove the populate route from the API.


