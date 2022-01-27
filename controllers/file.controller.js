import fs from 'fs'
import path from 'path'
import { v4 } from 'uuid'
import config from 'config'
import User from '../models/User.js'
import File from '../models/File.js'
import fileService from '../services/file.service.js'

const { getPath, getStaticPath } = fileService
const { extname } = path
const { existsSync, unlinkSync, mkdirSync } = fs

class FileController {
	async createDir (req, res) {
		try {
			const { name, type, parent } = req.body
			const file = new File({ name, type, parent, user: req.user.id })
			const parentFile = await File.findOne({ _id: parent })
			if (!parentFile) {
				file.path = name
				await fileService.createDir(req, file)
			} else {
				file.path = `${parentFile.path}/${file.name}`
				await fileService.createDir(req, file)
				parentFile.childs.push(file._id)
				await parentFile.save()
			}
			await file.save()
			return res.json(file)
		} catch (err) {
			console.log(err)
			return res.status(400).json(err)
		}
	}
	async fetchFiles (req, res) {
		try {
			const { parent, sort } = req.query
			let files
			switch (sort) {
				case 'name':
					files = await File.find({
						user: req.user.id,
						parent,
					}).sort({ name: 1 })
					break
				case 'type':
					files = await File.find({
						user: req.user.id,
						parent,
					}).sort({ type: 1 })
					break
				case 'date':
					files = await File.find({
						user: req.user.id,
						parent,
					}).sort({ date: 1 })
					break
				default:
					files = await File.find({
						user: req.user.id,
						parent,
					})
			}

			return res.json(files)
		} catch (err) {
			console.log(err)
			return res.status(500).json({ message: 'Can not get files' })
		}
	}
	async uploadFile (req, res) {
		try {
			const file = req.files.file

			const parent = await File.findOne({
				user: req.user.id,
				_id: req.body.parent,
			})
			const user = await User.findOne({
				_id: req.user.id,
			})

			if (user.usedSpace + file.size > user.diskSpace)
				return res
					.status(400)
					.json({ message: 'There no space on the disk' })

			user.usedSpace = user.usedSpace + file.size

			let path
			if (parent) {
				path = `${req.filePath}/${user._id}/${parent.path}/${file.name
					}`
			} else {
				path = `${req.filePath}/${user._id}/${file.name}`
			}

			if (existsSync(path))
				return res.status(400).json({ message: 'File already exist' })

			file.mv(path)

			const type = file.name.split('.').pop()
			let filePath = file.name
			if (parent) {
				filePath = `${parent.path}/${file.name}`
			}
			const dbFile = new File({
				name: file.name,
				type,
				size: file.size,
				path: filePath,
				parent: parent?._id,
				user: user._id,
			})

			await user.save()
			await dbFile.save()

			res.json(dbFile)
		} catch (err) {
			console.log(err)
			return res.status(500).json({ message: 'Upload error' })
		}
	}
	async downloadFile (req, res) {
		try {
			const file = await File.findOne({
				_id: req.query.id,
				user: req.user.id,
			})
			const path = getPath(req, file)
			if (existsSync(path)) {
				return res.download(path, file.name)
			}
			return res.status(400).json({ message: 'Download error' })
		} catch (err) {
			console.log(err)
			res.status(500).json({ message: 'Download error' })
		}
	}
	async deleteFile (req, res) {
		try {
			const file = await File.findOne({
				_id: req.query.id,
				user: req.user.id,
			})
			if (!file) {
				return res.status(400).json({ message: 'File not Found' })
			}
			fileService.deleteFile(req, file)
			await file.remove()
			return res.status(200).json({ message: 'File was deleted' })
		} catch (err) {
			console.log(err)
			return res.status(500).json({ message: 'File delete error' })
		}
	}
	async searchFile (req, res) {
		try {
			const searchName = req.query.search
			let files = await File.find({ user: req.user.id })
			files = files.filter(file => file.name.includes(searchName))
			return res.json(files)
		} catch (err) {
			console.log(err)
			return res.send(400).json({ message: 'Search error' })
		}
	}
	async uploadAvatar (req, res) {
		try {
			const file = req.files.file
			console.log(file)
			const user = await User.findById(req.user.id)
			const avatarName = v4() + extname(file.name)
			if (!existsSync(getStaticPath(req, { user: user._id }))) {
				mkdirSync(getStaticPath(req, { user: user._id }))
			}
			file.mv(getStaticPath(req, { user: user._id }) + '/' + avatarName)
			user.avatar = avatarName
			await user.save()
			return res.json(user)
		} catch (err) {
			console.log(err)
			return res.sendStatus(400).json({ message: 'Upload avatar error' })
		}
	}
	async deleteAvatar (req, res) {
		try {
			const user = await User.findById(req.user.id)
			unlinkSync(getStaticPath(req, { user: req.user.id }) + '/' + user.avatar)
			user.avatar = ''
			await user.save()
			return res.json(user)
		} catch (err) {
			console.log(err)
			return res.send(400).json({ message: 'Delete avatar error' })
		}
	}
}

export default new FileController()
