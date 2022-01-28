import chalk from 'chalk'
import config from 'config'
import express from 'express'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { mkdirSync, existsSync } from 'fs'
import fileUpload from 'express-fileupload'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'
import cors from './middleware/cors.middleware.js'
import filePath from './middleware/filepath.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { json } = express
const { connect } = mongoose
const { blue, red, gray, green } = chalk

const app = express()
const PORT = process.env.PORT ?? config.get('PORT')

app.use(filePath(resolve(__dirname, 'files')))
app.use(cors)
app.use(json())
app.use(fileUpload({}))
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)
app.use('/static', express.static('static'))

const start = async () => {
	try {
		connect(config.get('dbURL'), () => {
			console.log('Connected to DB')
		})
		// connect('mongodb://127.0.0.1:27017', () => {
		// 	console.log('Connected to DB')
		// })

		if (!existsSync('files')) {
			mkdirSync('files')
		}

		app.listen(PORT, () => console.log(blue('Listening on port: ' + PORT)))
	} catch (err) {
		console.log(err)
	}
}

start()
