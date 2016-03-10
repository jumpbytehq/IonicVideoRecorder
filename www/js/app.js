// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform, $rootScope, $ionicLoading) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
 
    $rootScope.toggle = function(text, timeout) {
      $rootScope.show(text);
 
      setTimeout(function() {
        $rootScope.hide();
      }, (timeout || 1000));
    };
 
    $rootScope.show = function(text) {
      $ionicLoading.show({
        template: text
      });
    };
 
    $rootScope.hide = function() {
      $ionicLoading.hide();
    };
  });
})

.controller('MainCtrl', ['$window', '$ionicPlatform', '$rootScope', '$scope', '$ionicScrollDelegate', '$ionicModal','$state',
  function($window, $ionicPlatform, $rootScope, $scope, $ionicScrollDelegate, AudioSvc, $ionicModal, $state) {
    $scope.files = [];

    $scope.func = function(){
        $rootScope.show('Accessing Videos.. Please wait');
        $window.requestFileSystem($window.LocalFileSystem.PERSISTENT, 0, function(fs) {

          fs.root.getDirectory('ionicrecorder', {create: true}, function(dirEntry){
                  var dirReader = dirEntry.createReader();
                  dirReader.readEntries(function(entries) {
                    if(entries.length === 0){
                      alert("No Videos available...");
                      $rootScope.hide();
                    }
                      var arr = [];
                      processEntries(entries, arr); // arr is pass by refrence
                      $scope.files = arr;
                      $rootScope.hide();
                  }, onError);
                }, onError);
 
            //Error
                function onError(error) {
                    alert("Failed to list directory contents: " + error.code);
                }
        },
        function(error) {
          console.log(error);
        });
    }
    

    $scope.func();
    $scope.clicked= function(){
        // capture callback
        var self =this;
      var captureSuccess = function(mediaFiles) {
          var i, path, len;
          for (i = 0, len = mediaFiles.length; i < len; i += 1) {
              path = mediaFiles[i].fullPath;

              var video = document.createElement('video');
              video.preload = 'metadata';
              video.onloadedmetadata = function() {
                window.URL.revokeObjectURL(path)
                var duration = video.duration;
                console.log("Time :" , duration)
              }
              video.onloadedmetadata();
              debugger;
              // do something interesting with the file
              var name = prompt("Please Enter video name.. ");
              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                fs.root.getDirectory(
                    "ionicrecorder",
                    {
                        create: true
                    },
                    function(dirEntry) {
                        dirEntry.getFile(
                            name + ".mp4", 
                            {
                                create: true, 
                                exclusive: false
                            }, 
                            function gotFileEntry(fe) {
                                var p = fe.toURL();
                                fe.remove();
                                ft = new FileTransfer();
                                ft.download(
                                    encodeURI(path),
                                    p,
                                    function(entry) { 
                                        $scope.imgFile = entry.toURL();
                                    },
                                    function(error) {
                                        
                                        alert("Download Error Source -> " + error.source);
                                    },
                                    false,
                                    null
                                );
                                $scope.func();
                            }, 
                            function() {
                                
                                console.log("Get file failed");
                            }
                        );
                    }
                    );
                });   
          }
      };

      // capture error callback
      var captureError = function(error) {
          navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
      };

      // start video capture
      navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
    };
    
      $scope.showFile = function(file) {
          if (hasExtension(file.name)) {
            if (file.name.indexOf('.mp4') > 0) {
              // Stop the audio player before starting the video
             // $scope.stopAudio();
             // VideoPlayer.play(file.nativeURL);
             var videoUrl = file.nativeURL;

             var options = {
              successCallback: function() {
                console.log("Player closed without error.");
              },
              errorCallback: function(errMsg) {
                console.log("Error! " + errMsg);
              }
            };

            // Just play a video
            window.plugins.streamingMedia.playVideo(videoUrl, options);
            } else {
              alert("File is not video file")
            }
          } else {
            $rootScope.toggle('Oops! We cannot play this file :/', 3000);
          }
 
      }
 
      function fsResolver(url, callback) {
        $window.resolveLocalFileSystemURL(url, callback);
      }
 
      function hasExtension(fileName) {
        var exts = ['.mp3', '.m4a', '.ogg', '.mp4', '.aac'];
        return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
      }
 
      function processEntries(entries, arr) {
 
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
 
          // do not push/show hidden files or folders
          if (e.name.indexOf('.') !== 0) {
            arr.push({
              id: i + 1,
              name: e.name,
              isUpNav: false,
              isDirectory: e.isDirectory,
              nativeURL: e.nativeURL,
              fullPath: e.fullPath
            });
          }
        }
        return arr;
      }
  }
])