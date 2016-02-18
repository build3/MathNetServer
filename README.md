# SERVER | NSF Physics 7 Communication Project #

### What is this repository for? ###
The server side of a project using Node.js. Students in groups will plot linear functions using an iPad application. This repository holds the server frontend and backend. More documentation can be found [here](https://drive.google.com/a/ucdavis.edu/folderview?id=0B1W6Ca2MINIsfmVmNEVxRWUyQkE5MXNseXRBZC1VV3A3ZzJBOUMwZGJuWE1HbFphZmhtaHM).

***

### Dependencies ###
* npm
* Node.js
* Socket.io
* MySQL

***

### Installation & Setup ###

#### OSX ####

First, you will want to install git, npm, Node.js, and MySQL if you haven't already. We'll be using brew.
```
brew update
brew install git node mysql
brew doctor
```

If you had to install MySQL, you'll need to set it up. 

Once MySQL is setup, be sure to start the MySQL server. **Your MySQL server needs to be at least version 5.6.**

Next, you'll want to clone this repository `git clone https://bitbucket.org/psalessi/server-nsf-physics-7-communication-project.git` 

Move into this new directory.

From there, you'll need to create a `secrets.js` file. The format should be the following but filled in with your database credentials (and what you wish your database and tables to be named):

```
#!javascript
module.exports = {
    host:"localhost",
    user:"root",
    password:"password",
    database:"database_name",
    class_table:"class_table_name",
    group_table:"group_table_name"
}
```

Once you have created secrets.js, you need to install the node modules for the project by running `npm install`.

After installation, you then run `node create_database.js` to create the necessary schema in MySQL.

Now, you are ready to run the server. To do so, run `node server.js`. You can then navigate to wherever the server is running and add the correct port number to the url.
For example, if running on `localhost` and `port 8888`, you would go to [http://localhost:8888/](http://localhost:8888/).

By default, the port number is set to `8888`, but if you wish to change it, simply open `server.js` and edit the port number on **line 2**. The line should look like this `var port = 8888;`.

#### Linux (Ubuntu) ####

First, you will want to install git, npm, Node.js, and MySQL if you haven't already using `apt-get`.

```
sudo apt-get update
sudo apt-get install git nodejs mysql-server-5.6
```

The server setup is the same as OSX except instead of using the command `node` to start the server and create the database, you want to use the command `nodejs`.

***

### How To Run Server as Daemon using Screen ###
1. SSH into Linux server
2. Open a new screen instance using `screen`
3. Start the communication server using `nodejs server.js`
4. Detach the screen using `ctrl-a, d`

To resume the screen instance, use `screen -r`
To kill the screen instance, use `ctrl-a, k` in the screen

***

### Versions ###
#### Version 1 Functionality by August 10th: ####
* A teacher should be able to create/leave a class.
* A teacher should be able to create/delete any number of groups in a class.
* A student should be able to login and set name.
* A student should be able to join/leave a class.
* A student should be able to join/leave any available group in a class.
* A student should be able to see the other students in a group upon joining.
* A student in a group should be notified when another student join/leaves the group.
* Students being able to move points on a graph asynchronously and update each other upon movement.
* It will only run on port 8888.
* It will run in browser on localhost until a server is acquired.
* A MySQL relational database will hold class/group data.

#### Version 2 Functionality by September 30th: ####

#### Version 3 Functionality by December 31st: ####