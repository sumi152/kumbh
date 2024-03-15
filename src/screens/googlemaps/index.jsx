import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import Green_Marker from '../../assets/Green_Marker.png';
import GetLocation from 'react-native-get-location';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

function GoogleMapsScreen() {
  const [permission, setPermission] = useState(false);
  const [marker, setMarker] = useState({
    latitude: 25.42972,
    longitude: 81.771385,
    name: "Kush",
    description: "All good"
  });

  const _saveLocation = async (lat, long) => {
    try {
      const response = await fetch('http://10.0.2.2:3000/saveLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "65f35676834dd4fcda7a4bb8",
          lat: lat.toString(),
          long: long.toString()
        }),
      });
      const data = await response.json();
      console.log(data);
      if (data.message === 'Location registered successfully') {
        console.log('Location saved successfully');
      } else {
        console.error('Failed to save location');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const _updateLocation = async (lat, long) => {
    try {
      const response = await fetch('http://10.0.2.2:3000/updateLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "65f35676834dd4fcda7a4bb8",
          lat: lat.toString(),
          long: long.toString()
        }),
      });
      const data = await response.json();
      console.log(data);
      if (data.message === 'Location updated successfully') {
        console.log('Location Updated successfully');
      } else {
        console.error('Failed to Update location');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const _getLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Please allow location permission to continue...',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermission(true);
          await _getCurrentLocation();
          _saveLocation(marker.latitude,marker.longitude)
          console.log('You can use the app');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const _getCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then(location => {
        console.log("My current location =>", location);
        setMarker({
          ...marker,
          latitude: location.latitude,
          longitude: location.longitude
        });
        _updateLocation(location.latitude, location.longitude);
        // Save location when page is rendered
        
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };

  useEffect(() => {
    _getLocationPermission();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      _getCurrentLocation();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      {permission ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: marker.latitude,
            longitude: marker.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <Marker
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.description}
          >
            <Image style={{ width: 60, height: 60, opacity: 0.7 }} source={Green_Marker} />
          </Marker>
          <Circle
            center={{
              latitude: marker.latitude,
              longitude: marker.longitude
            }}
            radius={100}
            strokeColor='black'
            fillColor='#EBF5FB'
          />
        </MapView>
      ) : (
        <Text>Please allow location permission to continue...</Text>
      )}
    </View>
  );
}

export default GoogleMapsScreen;
