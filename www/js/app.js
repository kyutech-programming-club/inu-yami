var ncmb = new NCMB("APIKEY", "CLIENTKEY"); //https://mbaas.nifcloud.com/
var History = ncmb.DataStore("History");
const distance_threshold = 2;

function login() {
  var login_name_form = document.getElementById("login_name");
  var login_name = login_name_form.value;
  var login_pass_form = document.getElementById("login_pass");
  var login_pass = login_pass_form.value;
  var user = new ncmb.User({ userName: login_name, password: login_pass });
  ncmb.User.login(user)
    .then(function () {
      if (ncmb.User.getCurrentUser().home_lat != -114514) {
        onDeviceReady();
       }
      document.querySelector('#navigator').pushPage('pets.html');
    })
    .catch(function (err) {
      ons.notification.alert('Incorrect username or password.' + err);
    })
}

function autoLogin() {
    var currentUser = ncmb.User.getCurrentUser();
    if (currentUser) {
        console.log("ログイン中のユーザー: " + currentUser.get("userName"));
        document.querySelector('#navigator').pushPage('pets.html');
    } else {
        console.log("未ログインまたは取得に失敗");
    }
}

function createAccount() {
  document.querySelector('#navigator').pushPage('signUp.html');
}

function logout() {
  ncmb.User.logout()
    .then(function () {
      window.BackgroundGeolocation.stopWatchPosition();
      document.querySelector('#navigator').resetToPage('login.html');
    })
    .catch(function (err) {
      alert("F Logout : " + err);
    });
}

function update_user(user) { // must not be used.
  var update_name = user.userName;
  var update_pass = user.password;
  alert("update_name: " + update_name);
  alert("update_pass: " + update_pass);
  var user = new ncmb.User({ userName: update_name, password: update_pass });
  ncmb.User.getCurrentUser()
    .logout()
    .then(function () {
      ncmb.User.login(user)
        .then(function () {
          alert("Success to update");
        })
        .catch(function () {
          alert("F Upfate");
        });
    })
    .catch(function () {
      alert("F Up()Logout");
    });
}

function add_user() {
  var user_name_form = document.getElementById("user_name");
  var user_name = user_name_form.value;
  var user_pass_form = document.getElementById("user_pass");
  var user_pass = user_pass_form.value;
  var dog_form = document.getElementById("dog_name");
  var dog_name = dog_form.value;
  if (user_name != "") {
    var user = new ncmb.User();
    user.set("userName", user_name)
      .set("password", user_pass)
      .set("dog_name", dog_name)
      .set("home_lat", -114514)
      .set("home_lng", -114514);
    user.signUpByAccount()
      .then(function (param) {
        console.log("Signed-Up successfully : " + JSON.stringify(param));
        ncmb.User.login(user)
          .then(function () {
              document.querySelector('#navigator').pushPage('pets.html');
            })
          .catch(function (err) {
            alert("Failed to login : " + err);
          });
      })
      .catch(function (err) {
        alert("Failed to signup : " + err);
      });
  }
}

function set_latlng() {
  navigator.geolocation.getCurrentPosition(function (pos) {
    console.log("Succeed to get latlng");
    var currentUser = ncmb.User.getCurrentUser();
    currentUser.set("home_lat", pos.coords.latitude)
               .set("home_lng", pos.coords.longitude)
               .update()
               .then(function () {
                //alert("Yes");
                update_user(currentUser);
                })
               .then(function () {
                onDeviceReady();
               });
  }, function (err) {
    console.log("ERR: " + JSON.stringify(err));
  });
}

function calc_distance(lat1, lng1, lat2, lng2) {
  const pi = 3.141592653589793238462643383279;
  var radlat1 = lat1 * pi / 180;
  var radlng1 = lng1 * pi / 180;
  var radlat2 = lat2 * pi / 180;
  var radlng2 = lng2 * pi / 180;
  const R = 6378137.0;  // 赤道半径
  var avarageLat = (radlat1 - radlat2) / 2.0;
  var avarageLng = (radlng1 - radlng2) / 2.0;
  var a = Math.pow(Math.sin(avarageLat), 2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.pow(Math.sin(avarageLng), 2);
  var b = Math.asin(Math.sqrt(a));
  var result = R * 2 * b;
  //alert(result)
  return result;
}

function add_history(pos) {
  var history = new History();
  // navigator.geolocation.getCurrentPosition(function(pos) {
  var currentUser = ncmb.User.getCurrentUser(),
    home_lat = currentUser.home_lat,
    home_lng = currentUser.home_lng,
    current_lat = pos.coords.latitude,
    current_lng = pos.coords.longitude,
    in_range = calc_distance(home_lat, home_lng, current_lat, current_lng) < distance_threshold;
  console.log("home_lat: " + home_lat + "\n" +
    "home_lng: " + home_lng + "\n" +
    "current_lat: " + current_lat + "\n" +
    "current_lng: " + current_lng + "\n" +
    "in_range: " + in_range);

  history.set("userId", currentUser.objectId)
    .set("at_home", in_range)
    .save()
    .then(function (result) {
      console.log("S Add history : " + JSON.stringify(result));
      get_lefting_time();
    })
    .catch(function (err) {
      alert("history error : " + err);
    });
  // }, function(err){}, {
  //   enableHighAccuracy: true,
  //   timeout: 5000,
  //   maximumAge: 300
  // });


}

function notice_messeage(times) {
  var messageTarget = document.getElementById("loveMessage");
  
  switch(times){
  case 0:messageTarget.innerHTML+="<p class='says'>楽しい</p><br>";break;
  case 1: messageTarget.innerHTML+="<p class='says'>ここにいるの？</p><br>";break;
  case 2:case 3: messageTarget.innerHTML+="<p class='says'>ねぇ</p><br>";break;
  case 4: messageTarget.innerHTML+="<p class='says'>なんで返信しないの</p><br>";break;
  case 5: messageTarget.innerHTML+="<p class='says'>もう無理...</p><br>";break;
  case 6: messageTarget.innerHTML+="<p class='says'>手首切ったるわ</p><br>";break;
  case 7: messageTarget.innerHTML+="<p class='says'>切ったワン</p><br>";break;
  case 8: messageTarget.innerHTML+="<p class='says'>縁も切ったワン<p><br>";break;
  case 9: messageTarget.innerHTML+"=<p class='says'>面白い冗談わんわん<p><br>";break;
  default:messageTarget.innerHTML+"=<p class='says'>僕と遊んでぇ<p><br>";break;
  };
}
 


function get_lefting_time() {
  var currentUser = ncmb.User.getCurrentUser();
  History.equalTo("userId", currentUser.objectId)
    .order("createDate", true)
    .fetchAll()
    .then(function (results) {
      var times = results.findIndex(function (item) {
        return item.at_home;
      });
      console.log("Lefting Time: " + times * 10 + "[min]");
      notice_messeage(times);
    })
    .catch(function (err) {
      alert("ERR: " + err);
    });
}

function movepage(pageName) {
  document.querySelector('#navigator').pushPage(pageName + ".html");
}

function showDogName() {
  if (ncmb.User.getCurrentUser()) {
    var nowDog = ncmb.User.getCurrentUser().get("dog_name");
    var target = document.getElementById("show_dog_name");
    // target.innerText = nowDog;
    console.log("pass");
  }
  else {
    console.log("notPass");
  }
}




