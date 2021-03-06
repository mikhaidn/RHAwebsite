var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:rhasite@rha-website-0.csse.rose-hulman.edu/rha'

/* GET active events */
router.get('/api/v1/events', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const query = client.query('SELECT proposal_name, event_date, event_signup_close, cost_to_attendee, image_path, description, attendees FROM proposals WHERE approved = true AND event_date >= CURRENT_DATE ORDER BY proposal_id ASC;');
    
    query.on('row', (row) => {
    	results.push(row);
    });

    query.on('end', () => {
    	done();
    	return res.json(results);
    });
  });
});

/* GET past events */
router.get('/api/v1/pastEvents', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console;
      console.log(err);
      return res.status(500).json({success: false, data: "You did something so bad you broke the server =("});
    }

    const query = client.query('SELECT proposal_name, event_date, cost_to_attendee, image_path, description, attendees FROM proposals WHERE approved = true AND event_date < CURRENT_DATE AND event_signup_open IS NOT NULL AND event_signup_close IS NOT NULL AND event_date IS NOT NULL ORDER BY proposal_id ASC;');
    
    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* PUT modify an event */
router.put('/api/v1/event/:id', (req, res, next) => {
  const results = [];

  const id = req.params.id;

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: "You broke it so hard it stopped =("});
    }

    var firstQuery = createUpdateQuery(id, 'proposal_id', req.body, 'proposals');

    var colValues = [];
    Object.keys(req.body).filter(function (key) {
      colValues.push(req.body[key]);
    });

    client.query(firstQuery, colValues);

    const query = client.query('SELECT * FROM proposals WHERE proposal_id = $1', [id]);

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* GET all officers */
router.get('/api/v1/officers', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console;
      console.log(err);
      return res.status(500).json({success: false, data: "You did something so bad you broke the server =("});
    }

    const query = client.query('SELECT user_id, username, firstname, lastname, hall, image, memberType FROM members WHERE memberType IS NOT NULL ORDER BY lastname ASC;');
    
    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* GET all committees */
router.get('/api/v1/committees', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console;
      console.log(err);
      return res.status(500).json({success: false, data: "You did something so bad you broke the server =("});
    }

    const query = client.query('SELECT committeeID, committeeName, description, image FROM Committee;');
    
    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* PUT modify a member */
router.put('/api/v1/member/:id', (req, res, next) => {
  const results = [];

  const id = req.params.id;

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: "You broke it so hard it stopped =("});
    }

    var firstQuery = createUpdateQuery(id, 'user_id', req.body, 'members'); 

    var colValues = [];
    Object.keys(req.body).filter(function (key) {
      colValues.push(req.body[key]);
    });

    client.query(firstQuery, colValues);

    const query = client.query('SELECT * FROM members WHERE user_id = $1', [id];

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* GET all committees */
router.get('/api/v1/committees', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console;
      console.log(err);
      return res.status(500).json({success: false, data: "You did something so bad you broke the server =("});
    }

    const query = client.query('SELECT * FROM committee ORDER BY committeeName ASC;');
    
    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* POST a new committee */
router.post('/api/v1/committee', (req, res, next) => {
  const results= [];

  const data = {committeeName: req.body.name, image: req.body.image, description: req.body.description};

  if(data.committeeName==null || data.description == null ) {
    return res.status(400).json({success: false, data: "This is not properly formed committee."});
  }

  pg.connect(connectionString, (err, client, done) => {

    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('INSERT INTO committee(committeeName, image, description) VALUES ($1, $2, $3);',
      [data.committeeName, data.image, data.description]);
    
    const query = client.query('SELECT * FROM committee WHERE committeeName = $1', [data.committeeName]);

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* PUT modify a committee */
router.put('/api/v1/committee/:id', (req, res, next) => {
  const results = [];

  const id = req.params.id;

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: "You broke it so hard it stopped =("});
    }

    var firstQuery = createUpdateQuery(id, 'committeeid', req.body, 'committee'); 

    var colValues = [];
    Object.keys(req.body).filter(function (key) {
      colValues.push(req.body[key]);
    });

    client.query(firstQuery, colValues);

    const query = client.query('SELECT * FROM committee WHERE committeeid = $1', [id]);

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* GET all funds */
router.get('/api/v1/funds', (req, res, next) => {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console;
      console.log(err);
      return res.status(500).json({success: false, data: "You did something so bad you broke the server =("});
    }

    const query = client.query('SELECT * FROM funds ORDER BY funds_id ASC;');
    
    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* PUT modify a fund */
router.put('/api/v1/fund/:id', (req, res, next) => {
  const results = [];

  const id = req.params.id;

  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: "You broke it so hard it stopped =("});
    }

    var firstQuery = createUpdateQuery(id, 'funds_id', req.body, 'funds'); 

    var colValues = [];
    Object.keys(req.body).filter(function (key) {
      colValues.push(req.body[key]);
    });

    client.query(firstQuery, colValues);

    const query = client.query('SELECT * FROM funds WHERE funds_id = $1', [id]);

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* POST a new proposal */
router.post('/api/v1/proposal', (req, res, next) => {
  const results= [];

  const data = {name: req.body.name, cost_to_attendee: req.body.cost_to_attendee, event_date: req.body.event_date, event_signup_open: req.body.event_signup_open, event_signup_close: req.body.event_signup_close, image_path: req.body.image_path, description: req.body.description, proposer_id: req.body.proposer_id, week_proposed: req.body.week_proposed, quarter_proposed: req.body.quarter_proposed, money_requested: req.body.money_requested, approved: req.body.approved};

  if(data.name==null || data.cost_to_attendee==null || data.event_date== null || data.description==null || data.proposer_id==null || data.week_proposed == null || data.quarter_proposed==null || data.money_requested==null ) {
    return res.status(400).json({success: false, data: "This is not properly formed proposal. Please follow proposal submission guidelines."});
  }

  pg.connect(connectionString, (err, client, done) => {

    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('INSERT INTO proposals(proposal_name, cost_to_attendee, event_date, event_signup_open, event_signup_close, image_path, description, proposer_id, week_proposed, quarter_proposed, money_requested, approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);',
      [data.name, data.cost_to_attendee, data.event_date, data.event_signup_open, data.event_signup_close, data.image_path, data.description, data.proposer_id, data.week_proposed, data.quarter_proposed, data.money_requested, data.approved]);
		
    const query = client.query('SELECT * FROM proposals WHERE proposal_name = $1', [data.name]);

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* Create an UpdateQuery */
function createUpdateQuery (filterVal, filter, cols, table) {
  var query = ['UPDATE ' + table + ' SET'];

  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + ' = ($' + (i + 1) + ')');
  });
  query.push(set.join(', '));

  query.push('Where ' + filter + ' = ' + filterVal);

  return query.join(' ');
}
module.exports = router;