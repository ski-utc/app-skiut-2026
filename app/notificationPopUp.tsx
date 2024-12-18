import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, FlatList } from "react-native";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { BlurView } from "expo-blur";
import { CircleX } from 'lucide-react';

const NotificationPopup = ({ visible, onClose }) => {
  const { height } = Dimensions.get("window");
  const notifications = [
    { id: 1, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 2, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 3, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 4, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 5, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 6, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 7, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 8, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
    { id: 9, title: "Titre", text: "C'est page notification a été construire sur le template de la page Notif de Pokémon TCG"},
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose} // Android back button
    >
        <BlurView intensity={10} tint="dark" style={styles.overlay}>
            <View style={{ 
                    backgroundColor: "white",
                    width: '80%',
                    height: height * 0.9, 
                    padding:0,
                    borderRadius: 40,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 10 , height: 10 },
                    shadowOpacity: 0.4,
                    shadowRadius: 50,
                    elevation: 5,
                }}
            >
                <View
                    style={{
                        width: '100%',
                        height:'9%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomColor: Colors.customBlack,
                        borderBottomWidth: 1,
                    }}
                >
                    <Text
                        style ={{
                            fontSize: 25,
                            fontFamily: Fonts.Title.Bold
                        }}
                    >
                            Notifications
                    </Text>
                </View>
                <View
                    style={{
                        height: '80%',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    <FlatList 
                        data={notifications} 
                        style={{padding: 20}}
                        renderItem={({ item }) => (
                            <View>
                                <Text>{item.title}</Text>
                                <Text>{item.text}</Text>
                            </View>
                        )}
                        keyExtractor={item => item.id.toString()}
                        ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
                    />
                </View>
                <View
                    style={{
                        width: '100%',
                        height:'11%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderTopColor: Colors.customBlack,
                        borderTopWidth: 1,
                    }}
                >  
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: "#000",
                            shadowOffset: { width: 10 , height: 10 },
                            shadowOpacity: 0.4,
                            shadowRadius: 25,
                            borderRadius: 100,
                        }}
                    >
                        <CircleX size={50} color={Colors.customBlack} />
                    </TouchableOpacity>
                </View>
            </View>
        </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "white",
    width: '80%',
    borderRadius: 40,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 10 , height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
    elevation: 5,
  },
});

export default NotificationPopup;
