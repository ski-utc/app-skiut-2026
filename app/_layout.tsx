import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '../components/navigation/TabBar'

// @ts-ignore
export default function RootLayout() {
  return (
    <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={props=> <TabBar {...props} />}
    >
        <Tabs.Screen
            name="index"
            options={{
                title: "Home",
                icon: "home"
            }}
        />
        <Tabs.Screen
            name="planning"
            options={{
                title: "Planning",
                icon: "calendar"
            }}
        />
        <Tabs.Screen
            name="potins"
            options={{
                title: "Potins",
                icon: "chatbox"
            }}
        />
        <Tabs.Screen
            name="defis"
            options={{
                title: "Défis",
                icon: "trophy"
            }}
        />
        <Tabs.Screen
            name="profil"
            options={{
                title: "Profil",
                icon: "person-circle"
            }}
        />
    </Tabs>
  );
}
