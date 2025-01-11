import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Colors } from '@/constants/GraphSettings';

interface Navette {
    id: number;
    departure: string;
    arrival: string;
    colour: string;
    type: string;
    horaire_depart: string;
    horaire_arrivee: string;
}

interface NavettesTabProps {
    navettesMap: { [key: string]: any[] };
    defaultType: "Aller" | "Retour";
    isAllerEmpty: boolean;
    isRetourEmpty: boolean;
}

const NavettesTab: React.FC<NavettesTabProps> = ({ navettesMap, defaultType, isAllerEmpty, isRetourEmpty }) => {
    const [selectedType, setSelectedType] = useState<"Aller" | "Retour">(defaultType);

    useEffect(() => {
        setSelectedType(defaultType);
    }, [defaultType]);

    const handlePress = (type: "Aller" | "Retour") => {
        setSelectedType(type);
    };

    const getColorFromString = (colorString) => {
        switch (colorString) {
            case 'Blue':
                return Colors.blue;
            case 'Green':
                return Colors.green;
            case 'Red':
                return Colors.red;
            default:
                return Colors.black; // Default to black if the color isn't found
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.buttonsContainer}>
                    {["Aller", "Retour"].map((type, index) => {
                        const isSelected = selectedType === type;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    { backgroundColor: isSelected ? Colors.orange : Colors.white }
                                ]}
                                onPress={() => handlePress(type as "Aller" | "Retour")}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    { color: isSelected ? Colors.white : Colors.black }
                                ]}>
                                    {type.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {selectedType && (
                    <View style={styles.navettesContainer}>
                        <FlatList
                            data={navettesMap[selectedType] || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.navetteContainer}>
                                    <View style={[styles.navetteIndicator, { backgroundColor: item.colour }]} />
                                    <View style={styles.navetteDetails}>
                                        <Text style={styles.navetteText}>
                                            {item.departure} → {item.arrival}
                                        </Text>
                                        <Text style={styles.navetteTimeText}>
                                            Départ : {item.horaire_depart} | Arrivée : {item.horaire_arrivee}
                                        </Text>
                                        <Text style={[styles.navetteCouleurText, { color: getColorFromString(item.colour) }]}>
                                            Couleur : {item.colour} 
                                        </Text>

                                    </View>
                                </View>
                            )}
                            style={styles.navettesList}
                        />
                    </View>
                )} 
                {selectedType === "Aller" && isAllerEmpty && (
                    <Text style={styles.emptyText}>Tu ne viens pas en bus. Contacte la team log si c'est une erreur. </Text>

                )}
                {selectedType === "Retour" && isRetourEmpty && (
                    <Text style={styles.emptyText}>Tu ne rentres pas en bus. Contacte la team log si c'est une erreur. </Text>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: "50%",
        width: "100%",
        backgroundColor: Colors.white
    },
    innerContainer: {
        paddingHorizontal: 5,
        paddingBottom: 16,
        flex: 1
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "95%",
        marginTop: 5,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.orange,
        alignSelf: "center"
    },
    button: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "600"
    },
    navettesContainer: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        marginTop: 10
    },
    navettesList: {
        flex: 1
    },
    navetteContainer: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.customGray,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    navetteIndicator: {
        width: 5,
        height: 55,
        borderRadius: 3,
        marginRight: 10
    },
    navetteDetails: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    navetteText: {
        color: Colors.black,
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: '600'
    },
    navetteTimeText: {
        color: Colors.gray,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400'
    },
    navetteCouleurText: {
        fontSize: 14,
        fontFamily: 'Bold',
        fontWeight: '500'
    }, 
    emptyText: {
        textAlign: "center",
        color: Colors.gray,
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "600",
        marginTop: 20
    }
});

export default NavettesTab;