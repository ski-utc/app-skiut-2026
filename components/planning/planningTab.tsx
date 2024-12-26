import React, { useState, useMemo, useCallback } from 'react';
import { Text, View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface Activity {
    activity: string;
    time: string;
}

interface PlanningTabProps {
    activitiesMap: { [key: string]: Activity[] };
}

const PlanningTab: React.FC<PlanningTabProps> = ({ activitiesMap }) => {
    const days = ["S 18", "D 19", "L 20", "Ma 21", "M 22", "J 23", "V 24", "S 25"];
    const [selectedDate, setSelectedDate] = useState("");

    const dayMap = useMemo(() => ({
        "S": "Samedi",
        "D": "Dimanche",
        "L": "Lundi",
        "Ma": "Mardi",
        "M": "Mercredi",
        "J": "Jeudi",
        "V": "Vendredi"
    }), []);

    const handlePress = useCallback((day: keyof typeof dayMap, number: string) => {
        setSelectedDate(`${dayMap[day]} ${number} Janvier`);
    }, [dayMap]);

    const selectedActivities = activitiesMap[selectedDate] || [];

    return (
        <View style={styles.container}>
            <View style={styles.daysContainer}>
                {days.map((day, index) => {
                    const [letter, number] = day.split(" ");
                    const isSelected = selectedDate === `${dayMap[letter]} ${number} Janvier`;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayButton,
                                { backgroundColor: isSelected ? Colors.orange : Colors.white }
                            ]}
                            onPress={() => handlePress(letter as keyof typeof dayMap, number)}
                        >
                            <Text style={[styles.dayLetter, { color: isSelected ? Colors.white : Colors.gray }]}>
                                {letter}
                            </Text>
                            <Text style={[styles.dayNumber, { color: isSelected ? Colors.white : Colors.black }]}>
                                {number}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <Text style={styles.selectedDateText}>
                {selectedDate || "Sélectionnez une date"}
            </Text>
            {selectedActivities.length > 0 ? (
                <FlatList
                    data={selectedActivities}
                    keyExtractor={(item, index) => `${item.activity}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.activityContainer}>
                            <View style={styles.activityIndicator} />
                            <View style={styles.activityDetails}>
                                <Text style={styles.activityTime}>{item.time}</Text>
                                <Text style={styles.activityText}>{item.activity}</Text>
                            </View>
                        </View>
                    )}
                    style={styles.activitiesList}
                />
            ) : (
                <Text style={styles.noActivitiesText}>
                    Aucune activité disponible pour cette date.
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: Colors.white
    },
    innerContainer: {
        paddingBottom: 16,
        flex: 1
    },
    daysContainer: {
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
    dayButton: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    dayLetter: {
        fontSize: 12,
        fontFamily: "Inter",
        fontWeight: "500"
    },
    dayNumber: {
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "600"
    },
    selectedDateText: {
        fontFamily: Fonts.Title.Light,
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginTop: 20
    },
    activitiesContainer: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        marginTop: 10
    },
    activitiesList: {
        flex: 1
    },
    activityContainer: {
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
    activityIndicator: {
        width: 5,
        height: 50,
        backgroundColor: Colors.orange,
        borderRadius: 3,
        marginRight: 10
    },
    activityDetails: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    activityTime: {
        color: Colors.black,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '600'
    },
    activityText: {
        color: Colors.gray,
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '400'
    },
    noActivitiesText: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: "center",
        marginTop: 10,
    }
});

export default PlanningTab;
