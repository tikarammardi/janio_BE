const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({
    first_name: {
        type: String,
        required: true
      },
      last_name: {
        type: String,
        required: true
      },
      mobile: {
        type: String,
        required: true,
        max: 10,
        unique: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },

      location_type: {
        type: String,
        required: true,
        enum: ['Country','City','Zip']
      },
      location_string: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true,
        enum: ['Created','Contacted']
      },
      communication: {
        type: String,
        required: false,
        default: ""
      },
})

mongoose.model('leads', LeadSchema);