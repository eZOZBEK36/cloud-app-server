import fs from 'fs'
import config from 'config'
import File from '../models/File.js'

const { mkdirSync, existsSync, rmdirSync, unlinkSync } = fs

class FileService {
	getPath({ user, path }) {
		return `${config.get('filePath')}/${user}/${path}`
	}
	createDir(file) {
		const filePath = `${config.get('filePath')}/${file.user}/${file.path}`
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
	deleteFile(file) {
		const path = this.getPath(file)
		if (file.type === 'dir') rmdirSync(path)
		else unlinkSync(path)
	}
	getStaticPath({ user }) {
		return `${config.get('staticPath')}/${user}`
	}
}

export default new FileService()
