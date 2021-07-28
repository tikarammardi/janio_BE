const mongoose = require('mongoose');
const express = require('express');
//load lead Model
require('../models/Leads');
const Lead = mongoose.model('leads');
const router = express.Router();


//get lead
router.get('/leads/:lead_id', async (req, res, next) => {

  try {
    const lead_id = req.params.lead_id;
    

    if (!lead_id.match(/^[0-9a-fA-F]{24}$/) || !lead_id) {
      return res.status(404).json({
        status: 'failure',
        reason: 'Required lead_id param missing or invalid'
      });
    }
    const leadInfo = await Lead.findOne({ _id: lead_id });
    if (!leadInfo) {
      return res.status(404).json({});
    }

    const responsePayload = {
      id: leadInfo._id,
      first_name: leadInfo.first_name,
      last_name: leadInfo.last_name,
      mobile: leadInfo.mobile,
      email: leadInfo.email,
      location_type: leadInfo.location_type,
      location_string: leadInfo.location_string,
      status: leadInfo.status,
      communication: leadInfo.communication
    }
    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(400).json({
      status: 'failure',
      reason: error.message
    });
  }
});



//create lead
router.post('/leads', async (req, res, next) => {
  try {

    let payload = req.body;

    if (!payload.first_name || !payload.last_name ||
      !payload.mobile || !payload.email ||
      !payload.location_type || !payload.location_string
    ) {

      throw new Error('Required params missing');
    }

    const duplicateEntry = await Lead.find({
      $or: [
        { email: payload.email },
        { mobile: payload.mobile }
      ]
    });

    if (duplicateEntry.length) {

      throw new Error('email/mobile should be unique');
    }
    const leadInfo = await new Lead({
      ...payload,
      status: 'Created'
    }).save();


    const responsePayload = {
      id: leadInfo._id,
      ...payload,
      status: leadInfo.status
    }

    return res.status(201).json(responsePayload);

  } catch (error) {
    console.error('error', error);
    return res.status(400).json({
      status: 'failure',
      reason: error.message
    });
  }

});

//update 
router.put('/leads/:lead_id', async (req, res, next) => {
  try {
    const lead_id = req.params.lead_id;
    const payload = req.body;
    if (!lead_id.match(/^[0-9a-fA-F]{24}$/) || !lead_id) {
      return res.status(400).json({
        status: 'failure',
        reason: 'Required lead_id param missing or invalid'
      });
    }

    if (!payload.first_name || !payload.last_name ||
      !payload.mobile || !payload.email ||
      !payload.location_type || !payload.location_string
    ) {


      throw new Error('Required params missing');
    }

    const leadInfoRes = await Lead.findOne({
      _id: lead_id
    });
    if (!leadInfoRes) {
      return res.status(404).json({
        status: 'failure',
        reason: `No info with id ${lead_id} is found`
      });
    }

    await Lead.findOneAndUpdate({
      _id: lead_id
    },
      {
        $set: payload
      },
      {
        new: true
      }).exec();

    return res.status(202).json({
      status: "success"
    });
  } catch (error) {
    console.error('update error', error);
    return res.status(400).json({
      status: 'failure',
      reason: error.message
    });
  }

});



//delete 
router.delete('/leads/:lead_id', async (req, res, next) => {
  try {
    const lead_id = req.params.lead_id;

    if (!lead_id.match(/^[0-9a-fA-F]{24}$/) || !lead_id) {

      throw new Error('Required lead_id param missing or invalid');
    }


    const deletedLeadInfo = await Lead.findOneAndDelete({
      _id: lead_id
    }).exec();

    if (!deletedLeadInfo) {
      return res.status(404).json({
        status: 'failure',
        reason: `No info with id ${lead_id} is found`
      });
    }



    return res.status(200).json({
      status: "success"
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failure',
      reason: error.message
    });
  }

});



//mark lead 
router.put('/mark_lead/:lead_id', async (req, res, next) => {
  try {
    const lead_id = req.params.lead_id;
    const payload = req.body;
    if (!lead_id.match(/^[0-9a-fA-F]{24}$/) || !lead_id || !payload.communication) {
      return res.status(400).json({
        status: 'failure',
        reason: 'Required lead_id param missing or invalid'
      });
    }


    const toUpdatePayload = {
      communication: payload.communication,
      status: "Contacted"
    }

    const markLeadRes = await Lead.findOneAndUpdate({
      _id: lead_id
    },
      {
        $set: toUpdatePayload
      },
      {
        new: true
      }).exec();

    if (!markLeadRes) {
      return res.status(404).json({
        status: 'failure',
        reason: `No info with id ${lead_id} is found`
      });
    }

    return res.status(202).json(toUpdatePayload);
  } catch (error) {
    return res.status(400).json({
      status: 'failure',
      reason: error.message
    });
  }

});

module.exports = router;