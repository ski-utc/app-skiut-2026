import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Modal, FlatList, StatusBar } from "react-native";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { BlurView } from "expo-blur";
import { CircleX } from 'lucide-react-native';

//@ts-ignore
export default function NotificationPopup ({ visible, onClose }) {
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
      onRequestClose={onClose}
    >
        <StatusBar style="light" translucent={true} backgroundColor="rgba(0,0,0,0.1)" />
        <BlurView 
            intensity={10} 
            tint="dark" 
            style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                justifyContent: "center",
                alignItems: "center",
            }} 
            experimentalBlurMethod="blur"
        >
            <View style={{ 
                    backgroundColor: "white",
                    width: '80%',
                    height: height * 0.9, 
                    padding:0,
                    borderRadius: 40,
                    alignItems: "center",
                    boxShadow: "10px 10px 50px rgba(0, 0, 0, 0.4)",
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
                            boxShadow: "10px 10px 25px rgba(0, 0, 0, 0.4)",
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