import chalk from 'chalk'
import config from 'config'
import express from 'express'
import { resolve } from 'path'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'
import cors from './middleware/cors.middleware.js'
import filePath from './middleware/filepath.middleware.js'

const { json } = express
const { connect } = mongoose
const { blue, red, gray, green } = chalk

const app = express()
const PORT = process.env.PORT ?? config.get('PORT')

app.use(cors)
app.use(json())
app.use(fileUpload({}))
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)
app.use(filePath(resolve(__dirname, 'files')))
app.use('/static', express.static('static'))

const start = async () => {
	try {
		connect(config.get('dbURL'), () => {
			console.log(green('Connected to DB'))
		})

		app.listen(PORT, () => console.log(blue('Listening on port: ' + PORT)))
	} catch (err) {
		console.log(err)
	}
}

start()
