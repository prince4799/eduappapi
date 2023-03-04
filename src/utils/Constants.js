const datetime=new Date();

  const error=(message='')=>{

    return{
        message:message,
        status:false,
        timestamp: datetime.toLocaleString(),
        status:401
    }
}

 const success=(message,token)=>{

    const successRes={
        message:message,
        status:true,
        timestamp: datetime.toLocaleString(),
        status:200 
    }
    successRes.token=token;
    return successRes
}

module.exports ={error,success}