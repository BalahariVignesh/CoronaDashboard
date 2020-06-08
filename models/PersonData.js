const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonDataSchema = new Schema({
    FID:{
        type: Number
    },
    IdFederalState:{

    },
    FederalState:{

    },
    County:{

    },
    AgeGroup:{

    },
    Gender:{

    },
    NumberofCasesInCorrespondingGroup:{

    },
    NumberOfDeathsInCorrespondingGroup:{

    },
    RegistrationDate:{

    },
    IdCounty:{

    },
    DataStatus:{

    },
    NewCase:{

    },
    NewDeath:{

    },
    ReferenceDate:{

    },
    NewRecovery:{

    },
    NumberOfRecoveryInCorrespondingGroup:{

    },
    IsOnsetOfIllness:{

    },
    AgeGroup2:{

    }

});

module.exports = PersonData = mongoose.model('person',PersonDataSchema)