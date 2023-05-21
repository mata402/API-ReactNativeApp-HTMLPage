import React, {useEffect, useState} from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, useColorScheme } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';

const HomeScreen = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData("http://10.0.2.2:5218/user/generate-users");
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerTitle: "Who Exists?",
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (event) => {
          searchFilterFunction(event.nativeEvent.text);
        },
      },
      headerTitleStyle: {
        color: '#000',
      },
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
    });
  }, [navigation]);

  const fetchData = async (url) => {
    try {
      const response = await axios.get(url);
      const users = response.data.results;
      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          const id = `${user.gender.substring(0,4)}${user.registered.age}${user.location.country.substring(0,4)}`
          const { gender, registered, location } = user;
          const apiUrl = `http://10.0.2.2:5218/user/generate-token/${id}`;
          try {
            const tokenResponse = await axios.get(apiUrl);
            const token = tokenResponse.data.token;
            return {
              ...user,
              token
            };
          } catch (error) {
            console.error(error);
            return user;
          }
        })
      );
      setData(updatedUsers);
      setFilteredData(updatedUsers);
    } catch (error) {
      console.error(error);
    }
  };

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = data.filter(({ name }) => {
        const fullName = `${name.first} ${name.last}`.toLocaleUpperCase();
        const searchText = text.toLocaleUpperCase();
        return fullName.includes(searchText)
      });
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {
        filteredData.map((item, index) => {
          return (
            <View key={index} style={styles.itemContainer}>
              <Image
                source={{ uri: item.picture.large }}
                style={styles.image}
              />
              <View>
                <Text style={styles.textName}>{item.name.first} {item.name.last}</Text>
                <Text style={styles.textEmail}>{item.gender} {item.registered.age + 16}, {item.location.country}</Text>
                <Text style={styles.textToken}>{item.token.slice(5)}</Text>
              </View>
            </View>
          )
        })
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF"
  },
  textFriends: {
    fontSize: 20,
    textAlign: 'left',
    marginLeft: 10,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000000'
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
  },
  image: {
      width: 50,
      height: 50,
      borderRadius: 25,
  },
  textName: {
      fontSize: 16,
      marginLeft: 10,
      fontWeight: "600",
      color: '#000000'
  },
  textEmail: {
      fontSize: 14,
      marginLeft: 10,
      color: "grey",
  },
  textToken: {
      fontSize: 12,
      marginLeft: 10,
      color: "green",
},
});

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="again " component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;