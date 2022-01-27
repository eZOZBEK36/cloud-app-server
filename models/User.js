import mongoose from 'mongoose'
const { model, Schema } = mongoose

const User = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	diskSpace: {
		type: Number,
		required: true,
		default: 1024 ** 3 * 10,
	},
	usedSpace: {
		type: Number,
		required: true,
		default: 0,
	},
	avatar: { type: String },
	files: [{ type: Number, ref: 'File' }],
})

export default model('User', User)
