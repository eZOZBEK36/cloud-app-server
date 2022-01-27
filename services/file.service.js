import fs from 'fs'
import File from '../models/File.js'

const { mkdirSync, existsSync, rmdirSync, unlinkSync } = fs

class FileService {
	getPath (req, { user, path }) {
		return `${req.filePath}/${user}/${path}`
	}
	createDir (req, file) {
		console.log(req.filePath)
		console.log(file)
		const filePath = `${req.filePath}/${file.user}/${file.path}`
		return new Promise((resolve, reject) => {
			try {
				if (!existsSync(filePath)) {
					mkdirSync(filePath)
					return resolve({ message: 'File was created' })
				} else {
					return reject({ message: 'File already exist' })
				}
			} catch (err) {
				return reject({ message: 'File error' })
			}
		})
	}
	deleteFile (req, file) {
		const path = this.getPath(req, file)
		if (file.type === 'dir') rmdirSync(path)
		else unlinkSync(path)
	}
	getStaticPath (req, { user }) {
		return `${req.filePath}/${user}`
	}
}

export default new FileService()
