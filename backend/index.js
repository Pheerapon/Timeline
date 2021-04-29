const express = require('express'),
    app = express(),
    passport = require('passport'),
    port = process.env.PORT || 8001,
    cors = require('cors'),
    cookie = require('cookie')

const bcrypt = require('bcrypt')

const db = require('./database.js')
let users = db.users

let timelines = {
    list:
        [
            { id: "1", Day: 'Mon', Month: 'JAN', Year: "2564", Time: '08.00', Place: 'home' },
            { id: "2", Day: 'Mon', Month: 'JAN', Year: "2564", Time: '09.00', Place: 'home' },

        ]
}

require('./passport.js')

const router = require('express').Router(),
    jwt = require('jsonwebtoken')

app.use('/api', router)
router.use(cors({ origin: 'http://localhost:3000', credentials: true }))
// router.use(cors())
router.use(express.json())
router.use(express.urlencoded({ extended: false }))

//-----------------------------------------------------------------------------------------// 
//Students

router.route('/timelines')
    .get((req, res) => res.json(timelines))
    .post((req, res) => {
        console.log(req.body)
        //let id = (timelines.list.length)? timelines.list[timelines.list.length-1].id+1:1
        let NewTimeline = {}
        NewTimeline.id = (timelines.list.length) ? timelines.list[timelines.list.length-1].id+1 : 1
        NewTimeline.Day = req.body.Day
        NewTimeline.Month = req.body.Month
        NewTimeline.Year = req.body.Year
        NewTimeline.Time  = req.body.Time
        NewTimeline.Place  = req.body.Place
        timelines = { list: [...timelines.list, NewTimeline] }
        res.json(timelines)
    })

router.route('/timelines/:student_id') //params
    .get((req, res) => {
        let id = timelines.list.findIndex((item) => (+item.id === +req.params.student_id))
        
        if (id === -1) {
            res.send('Not Found')
        }
        else {
            res.json(timelines.list[id])
        }
        

    })
    .put((req, res) => {
        let id = timelines.list.findIndex((item) => (+item.id === +req.params.student_id))
        if (id === -1) {
            res.send('Not Found')
        }
        else {
            timelines.list[id].Day = req.body.Day
            timelines.list[id].Month = req.body.Month
            timelines.list[id].Year = req.body.Year
            timelines.list[id].Time = req.body.Time
            timelines.list[id].Place = req.body.Place
            res.json(timelines)
        }


    })
    .delete((req, res) => {
       
        let id = timelines.list.findIndex((item) => (+item.id === +req.params.student_id))
        if (id === -1) {
            res.send('Not Found')
        }
        else {
            timelines.list = timelines.list.filter((item) => +item.id !== +req.params.student_id)
            res.json(timelines)
        }
    })


//-----------------------------------------------------------------------------------------// 


router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        console.log('Login: ', req.body, user, err, info)
        if (err) return next(err)
        if (user) {
            const token = jwt.sign(user, db.SECRET, {
                expiresIn: (req.body.rememberme === "on") ?'7d' : '1d'
            })
            // req.cookie.token = token
            res.setHeader(
                "Set-Cookie",
                cookie.serialize("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== "development",
                    maxAge: 60 * 60,
                    sameSite: "strict",
                    path: "/",
                })
            );
            res.statusCode = 200
            return res.json({ user, token })
        } else
            return res.status(422).json(info)
    })(req, res, next)
})

router.get('/logout', (req, res) => { 
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            maxAge: -1,
            sameSite: "strict",
            path: "/",
        })
    );
    res.statusCode = 200
    return res.json({ message: 'Logout successful' })
})

/* GET user profile. */
router.get('/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        res.send(req.user)
    });

router.get('/foo',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        return res.json({ message: "Foo" })
    });

router.post('/register',
    async (req, res) => {
        try {
            const SALT_ROUND = 10
            const { username, email, password } = req.body 
            if (!username || !email || !password)
                return res.json( {message: "Cannot register with empty string"})
            if (db.checkExistingUser(username) !== db.NOT_FOUND)
                return res.json({ message: "Duplicated user" })

            let id = (users.users.length) ? users.users[users.users.length - 1].id + 1 : 1
            hash = await bcrypt.hash(password, SALT_ROUND)
            users.users.push({ id, username, password: hash, email })
            res.status(200).json({ message: "Register success" })
        } catch {
            res.status(422).json({ message: "Cannot register" })
        }
    })

router.get('/alluser', (req,res) => res.json(db.users.users))

router.get('/', (req, res, next) => {
    res.send('Respond without authentication');
});


// Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.status || 500
    res.status(statusCode);
    res.json({
        error: {
            status: statusCode,
            message: err.message,
        }
    });
});

// Start Server
app.listen(port, () => console.log(`Server is running on port ${port}`))