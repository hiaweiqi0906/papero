 User.findOneAndUpdate({ email: req.user.email }, {
            firstName: first_name,
            lastName: last_name,
            gender: gender,
            noTel: noTel,
            states: states,
            location: location,
            whatsappLink: whatsappLink,
            messengerLink: messengerLink,
            wechatLink: wechatLink,
            instagramLink: instagramLink
            // ,
            // avatarUri:{
            //     type:String
            // }
        }, (err, doc) => {
            if (err) throw err
            else {
                res.redirect('/sellers/setting')
            }
        })