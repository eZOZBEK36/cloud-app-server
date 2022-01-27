import mongoose from 'mongoose'
const { model, Schema, Types } = mongoose

const { ObjectId } = Types

const File = new Schema({
	name: { type: String, required: true },
	type: { type: String, required: true },
	accessLink: { type: String },
	size: { type: Number, default: 0 },
	path: { type: String, default: '' },
	user: { type: ObjectId, ref: 'User' },
	parent: { type: ObjectId, ref: 'File' },
	childs: [{ type: ObjectId, ref: 'File' }],
	date: { type: Date, default: Date.now() },
})

export default model('File', File)
