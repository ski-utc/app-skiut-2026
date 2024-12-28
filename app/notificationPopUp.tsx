import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Modal, FlatList, StatusBar } from "react-native";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { BlurView } from "expo-blur";
import { CircleX } from "lucide-react-native";

// @ts-ignore
export default function NotificationPopup({ visible, onClose }) {
  const notifications = [
    { id: 1, title: "Nouvelle Notification", text: "Vous avez une nouvelle tâche à accomplir." },
    { id: 2, title: "Mise à jour", text: "Votre application a été mise à jour avec succès." },
    { id: 3, title: "Rappel", text: "N'oubliez pas votre réunion de 15h aujourd'hui." },
    { id: 4, title: "Succès", text: "Votre commande a été expédiée." },
    { id: 5, title: "Nouvelle Notification", text: "Vous avez une nouvelle tâche à accomplir." },
    { id: 6, title: "Mise à jour", text: "Votre application a été mise à jour avec succès." },
    { id: 7, title: "Rappel", text: "N'oubliez pas votre réunion de 15h aujourd'hui." },
    { id: 8, title: "Succès", text: "Votre commande a été expédiée." },
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
        <StatusBar style="light" translucent={true} backgroundColor="rgba(0,0,0,0.2)" />
        <BlurView 
            intensity={20} 
            tint="dark" 
            style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                justifyContent: "center",
                alignItems: "center",
            }} 
            experimentalBlurMethod="blur"
        >
        <View
          style={{
            backgroundColor: "white",
            width: "85%",
            height: '85%',
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#EAEAEA",
              paddingBottom: 10,
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontFamily: Fonts.Inter.Basic,
                fontWeight: '800',
                color: Colors.customBlack,
              }}
            >
              Notifications
            </Text>
          </View>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#F9F9F9",
                  padding: 15,
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.Title.Bold,
                    color: Colors.customBlack,
                    marginBottom: 5,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    color: Colors.gray,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Close Button */}
          <View
            style={{
              marginTop: 15,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#EAEAEA",
              paddingTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 50,
                height: 50,
                backgroundColor: Colors.customBlack,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <CircleX size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
