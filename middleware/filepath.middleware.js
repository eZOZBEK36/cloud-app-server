const filePath = (path) => (req, res, next) => {
	req.filePath = path
	next()
}

export default filePath
