function onDeviceReady() {
  console.log("onDeviceReady");
  var bgGeo = window.BackgroundGeolocation;
  var getNum = 0;
  // 初期設定
  bgGeo.ready({
    // 位置情報に関する設定
    desiredAccuracy: 0,
    distanceFilter: 0,
    disableElasticity: true,
    stopAfterElapsedMinutes: 10000,
    elasticityMultiplier: 0,
  //  stationaryRadius: 50, ios only
    allowIdenticalLocations: true,
    locationUpdateInterval: 100,
    fastestLocationUpdateInterval: 5000,
    
    // アクティビティ認識の初期設定
    //activityType: 'AutomotiveNavigation', ios only
    //activityRecognitionInterval: 10000, no longer used
    stopTimeout: 1,
    
    // アプリケーションの設定
    debug: true,
    stopOnTerminate: false,
    startOnBoot: true
  });
// }, function(state) {
//     // 設定完了時のコールバック
//    // console.log('BackgroundGeolocation ready: ', state);
    
//     // 設定が終わったら起動します
//     if (!state.enabled) {
//         bgGeo.start();
//     }

  bgGeo.watchPosition(add_history, function(errorCode) {
      console.warn('- BackgroundGeoLocation error: ', errorCode)
  }, {
      interval: 10000,
      persist: true,
      timeout: 100000000
  });
}