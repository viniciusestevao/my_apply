import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Home from "../pages/Home";
import Users from "../pages/Users";
import exportedFunctions from "../pages/People";
import Applies from "../pages/Applies";
import Tests from "../pages/Tests";
import StackRoutes from "./stackRoutes";

const Drawer = createDrawerNavigator();

function Routes() {
  return (
    <Drawer.Navigator
      initialRouteName="LoginScreenDrawer"
      screenOptions={{
        headerShown: false,

        drawerStyle: {
          backgroundColor: "#191A1E",
          paddingTop: 25,
        },

        drawerActiveBackgroundColor: "#47BFF9",
        drawerActiveTintColor: "#FFF",
        drawerInactiveTintColor: "#FFF",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: "Início",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Users"
        component={Users}
        options={{
          title: "Usuários",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={focused ? "account-cog" : "account-cog-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Candidates"
        component={exportedFunctions.Candidate}
        options={{
          title: "Candidatos",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={focused ? "account-details" : "account-details-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Recruiters"
        component={exportedFunctions.Recruiter}
        options={{
          title: "Recrutadores",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={
                focused ? "account-tie" : "account-tie-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      /> 
      <Drawer.Screen
        name="Applies"
        component={Applies}
        options={{
          title: "Aplicações",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={
                focused ? "account-search" : "account-search-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />  
      <Drawer.Screen
        name="Tests"
        component={Tests}
        options={{
          title: "Questionários",
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={
                focused ? "view-list" : "view-list-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />  
      <Drawer.Screen
        name="LoginScreenDrawer"
        component={StackRoutes}
        options={{
          title: "Sair",
          swipeEnabled: false,
          drawerIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons
              name={"logout"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default Routes;
