import config from 'config'
import jwt from 'jsonwebtoken'

const { verify } = jwt

export default (req, res, next) => {
	if (req.method === 'OPTIONS') {
		next()
	}

	try {
		const token = req.headers.authorization.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'Auth error' })
		}

		const decoded = verify(token, config.get('secretKey'))
		req.user = decoded
		next()
	} catch (err) {
		console.log(err)
		return res.status(401).json({ message: 'Auth error' })
	}
}
