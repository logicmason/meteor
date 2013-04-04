Users = new Meteor.Collection("users");
Questions = new Meteor.Collection("questions");


if (Meteor.isClient) {
  Session.set('page', 'main');

  Template.main.isMain = function() {
    return Session.get('page') === "main";
  };

  Template.questionPage.oneQuestion = function() {
    console.log("questionPage.oneQuestion ", Questions.findOne(Session.get('selected_question')));
    return Questions.findOne(Session.get('selected_question'));
  };

  Template.questionsList.questions = function() {
    return Questions.find({}, {sort: {dateTime: -1, title: 1}});
  };

  Template.question.question = function() {
    console.log("question.question ", Questions.find(Session.get('selected_question')).fetch());
    return Questions.findOne(Session.get('selected_question'));
  };

  Template.question.askerName = function() {
    var username = Users.findOne(this.asker);
    if (username) {
      return username.name;
    }
  };

  Template.details.answering = function() {
    return (Session.get("page") === "answers");
  };

  Template.question.getQ = function() {
    console.log("Calling getQ");
    return Questions.findOne(Session.get('selected_question'));
  };

  Template.question.selected = function() {
    return Session.equals("selected_question", this._id) ? "selected" : '';
  };

  Template.question.answerQuestion = function(userID) {

  };

  Template.question.debug = function() {
    debugger;
  };

  Template.hello.setCurrentUser = function(username) {
    var currentUser = Users.findOne({name: username});
    //Insert user if name not found
    if (currentUser === undefined) {
      console.log("Undefined user. Adding ", username);
      Users.insert({name: username, reputation: 0});
      currentUser = Users.findOne({name: username});
    }
    //Set current_user session
    Session.set("current_user", currentUser._id);
    console.log(currentUser.name + " exists. Set session for ID " + currentUser._id);
  };

  Template.hello.current_user = function() {
    var username = Session.get("current_user");
    username = Users.findOne(username);
    if (username != undefined) {
      return username.name;
    }
    else {
      return '';
    }
  };

  Template.hello.logOutUser = function() {
    Session.set("current_user", null);
  };

  Template.hello.addQuestion = function(question) {
    if (!question.title) {
      alert("You need a title for your question");
    } else if (!question.text) {
      alert("You need a body for your question");
    } else if (!question.asker) {
      alert("You need to log in to ask your question");
    } else {
      Questions.insert(question);
      console.log("Question inserted");
      console.log(question);
    }
  };

  Template.hello.events({
    'click .submitBtn' : function() {
      var username = $('input.currentUser').val();
      Template.hello.setCurrentUser(username);
    },
    'click .logoutBtn' : function() {
      Template.hello.logOutUser();
    },
    'click .askQuestionBtn' : function() {
      var questionTitle = $('.questionTitle').val();
      var questionBody = $('.questionBody').val();
      var currentUser = Session.get("current_user");
      var question = { title: questionTitle, text: questionBody, asker: currentUser, votes: 0, dateTime: Date.now()};
      Template.hello.addQuestion(question);
    },
  });

  Template.question.events({
    'click .title' : function() {
      console.log(this._id);
      Session.set('selected_question', this._id);
    },
    'click .answerBtn' : function() {
      Session.set('page', 'answers');
      Template.question.question(this._id);
    },
    'click .voteUpBtn' : function() {
      Questions.update(this._id, {$inc: { votes: 1 }});
      var updateRepUser = Users.findOne(Questions.findOne(Session.get("selected_question")).asker);
      Users.update(updateRepUser._id, {$inc: {reputation: 1}});
    },
    'click .voteDownBtn' : function() {
      Questions.update(this._id, {$inc: { votes: -1 }});
      var updateRepUser = Users.findOne(Questions.findOne(Session.get("selected_question")).asker);
      Users.update(updateRepUser._id, {$inc: {reputation: -1}});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    console.log("Starting up server");
    console.log("Number of users");
    console.log(Users.find().count());
    if (Users.find().count() === 0) {
      var usernames = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      var question = {
        title: "why is it broken???",
        text: "full text",
        asker: null,
        votes: 0,
        dateTime: Date.now()
      };
      console.log("Looping start");

      for (var i = 0; i < usernames.length; i++) {
        var userID = Users.insert({name: usernames[i], reputation: 0});
        console.log("UserID:", userID);
        var newQuestion = question;
        newQuestion.asker = userID;
        Questions.insert(question);
      }
    }
  });
}