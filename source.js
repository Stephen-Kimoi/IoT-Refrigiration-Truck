function GetMap() {
    //Instantiate a map object
    var map = new atlas.Map("myMap", {
        //Azure maps subscription key 
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'BHR3jPNVCUb_rVM64gvnfZabTxn98cZkG2KHx3DlJEY'
        }
    });
}