import config from 'config'
import Router from 'express'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import File from '../models/File.js'
import User from '../models/User.js'
import FileService from '../services/file.service.js'
import { check, validationResult } from 'express-validator'
import authMiddleware from '../middleware/auth.middleware.js'

const { sign } = jwt
const { createDir } = FileService
const { hash, compareSync } = bcryptjs

const router = new Router()

router.post(
	'/registration',
	[
		check('email', 'Uncorrect email').isEmail(),
		check(
			'password',
			'Password must be longer than 3 and shorter 12',
		).isLength({ min: 3, max: 12 }),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty())
				return res
					.status(400)
					.json({ message: 'Uncorrect request', errors })

			const { email, password } = req.body
			const candidate = await User.findOne({ email })
			if (candidate)
				return res
					.status(400)
					.json({ message: 'User with email ' + email + ' arleady exist' })

			const hashPassword = await hash(password, 4)
			const user = new User({ email, password: hashPassword })

			await user.save()

			await createDir(req, new File({ user: user.id, name: '' }))

			return res.json({ message: 'Success! User was created' })
		} catch (err) {
			console.log(err)
			res.send({ message: 'Server error' })
		}
	},
)
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })

		if (!user) return res.status(404).json({ message: 'User not found' })

		const isPassValid = compareSync(password, user.password)
		if (!isPassValid)
			return res.status(400).json({ message: 'Invalid password' })

		const token = sign({ id: user.id }, config.get('secretKey'), {
			expiresIn: '1h',
		})

		return res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				diskSpace: user.diskSpace,
				usedSpace: user.usedSpace,
				avatar: user.avatar,
			},
		})
	} catch (err) {
		console.log(err)
		res.send({ message: 'Server error' })
	}
})
router.get('/auth', authMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.user.id })
		const token = sign({ id: user.id }, config.get('secretKey'), {
			expiresIn: '1h',
		})

		return res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				diskSpace: user.diskSpace,
				usedSpace: user.usedSpace,
				avatar: user.avatar,
			},
		})
	} catch (err) {
		console.log(err)
		res.send({ message: 'Server error' })
	}
})

export default router
