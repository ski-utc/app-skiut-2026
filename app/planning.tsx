import { Text, View, SafeAreaView } from "react-native";
import Header from "../components/Header";

export default function Planning() {
  return (
    <SafeAreaView
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Header text="Planning"/>
      
      <Text style={{ fontSize: 16, color: "black", marginTop: 10, marginLeft: 21, fontFamily: "Inter-SemiBold", alignSelf: "flex-start" }}>Planning</Text>
      
      <View
        style={{
          width: 334,
          height: 80,
          padding: 8,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#E64034',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 10,
          display: 'flex',
          marginTop: 8, // Added top margin
        }}
      >
        <View
          style={{
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 8,
        display: 'flex',
        flexDirection: 'row',
          }}
        >
          {[
        { day: 'S', date: '18', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'D', date: '19', backgroundColor: '#E64034', textColor: 'white' },
        { day: 'L', date: '20', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'M', date: '21', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'M', date: '22', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'J', date: '23', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'V', date: '24', backgroundColor: 'transparent', textColor: 'black' },
        { day: 'S', date: '25', backgroundColor: 'transparent', textColor: 'black' },
          ].map((item, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            backgroundColor: item.backgroundColor,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10,
            display: 'flex',
          }}
        >
          <Text style={{ color: '#ACACAC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500' }}>{item.day}</Text>
          <Text style={{ color: item.textColor, fontSize: 16, fontFamily: 'Inter', fontWeight: '600' }}>{item.date}</Text>
        </View>
          ))}
        </View>
      </View>

      <Text style={{ fontSize: 16, color: "black", marginTop: 10, marginLeft: 21, fontFamily: "Inter-SemiBold", alignSelf: "flex-start" }}>Dimanche 19 Janvier</Text>

      <View style={{ width: 350, height: 285, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        {[
          { time: '8h - 10h', description: 'Petit déjeuner en bas de l’hotel', backgroundColor: '#E0E0E0', opacity: 0.40 },
          { time: '11h - 12h', description: 'Concours de sauts', backgroundColor: '#E0E0E0', opacity: 0.40 },
          { time: '14h - 16h', description: 'Repas offert par la maison à la salle hors sac !!!', backgroundColor: '#E64034', opacity: 1 },
          { time: '18h - 20h', description: 'Appéro !!', backgroundColor: 'white', opacity: 1 },
          { time: '22h', description: 'Tournée des chambres', backgroundColor: 'white', opacity: 1 },
        ].map((item, index) => (
          <View key={index} style={{ alignSelf: 'stretch', paddingLeft: 10, paddingRight: 10, paddingTop: 12, paddingBottom: 12, opacity: item.opacity, borderBottomWidth: 1, borderBottomColor: '#EAEAEA', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex', flexDirection: 'row' }}>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex' }}>
              <View style={{ width: 9, height: 9, backgroundColor: item.backgroundColor, borderRadius: 18 }} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex' }}>
              <Text style={{ color: '#171717', fontSize: 14, fontFamily: 'Inter', fontWeight: '600'}}>{item.time}</Text>
              <Text style={{ color: '#737373', fontSize: 12, fontFamily: 'Inter', fontWeight: '400'}}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      </View>
      

    </SafeAreaView>
  );
}
