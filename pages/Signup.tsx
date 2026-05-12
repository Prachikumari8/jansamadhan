import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Smartphone, ArrowRight, Check, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useGoogleLogin } from '@react-oauth/google';

const LOCATION_DATA: any = {
  "Andaman and Nicobar Islands": {
    "Nicobars": [
      "Nicobars City",
      "Nicobars Town",
      "Rural Area"
    ],
    "North And Middle Andaman": [
      "North And Middle Andaman City",
      "North And Middle Andaman Town",
      "Rural Area"
    ],
    "South Andamans": [
      "South Andamans City",
      "South Andamans Town",
      "Rural Area"
    ]
  },
  "Andhra Pradesh": {
    "Alluri Sitharama Raju": [
      "Alluri Sitharama Raju City",
      "Alluri Sitharama Raju Town",
      "Rural Area"
    ],
    "Anakapalli": [
      "Anakapalli City",
      "Anakapalli Town",
      "Rural Area"
    ],
    "Ananthapuramu": [
      "Ananthapuramu City",
      "Ananthapuramu Town",
      "Rural Area"
    ],
    "Annamayya": [
      "Annamayya City",
      "Annamayya Town",
      "Rural Area"
    ],
    "Bapatla": [
      "Bapatla City",
      "Bapatla Town",
      "Rural Area"
    ],
    "Chittoor": [
      "Chittoor City",
      "Chittoor Town",
      "Rural Area"
    ],
    "Dr. B.R. Ambedkar Konaseema": [
      "Dr. B.R. Ambedkar Konaseema City",
      "Dr. B.R. Ambedkar Konaseema Town",
      "Rural Area"
    ],
    "East Godavari": [
      "East Godavari City",
      "East Godavari Town",
      "Rural Area"
    ],
    "Eluru": [
      "Eluru City",
      "Eluru Town",
      "Rural Area"
    ],
    "Guntur": [
      "Guntur City",
      "Guntur Town",
      "Rural Area"
    ],
    "Kakinada": [
      "Kakinada City",
      "Kakinada Town",
      "Rural Area"
    ],
    "Krishna": [
      "Krishna City",
      "Krishna Town",
      "Rural Area"
    ],
    "Kurnool": [
      "Kurnool City",
      "Kurnool Town",
      "Rural Area"
    ],
    "Markapuram": [
      "Markapuram City",
      "Markapuram Town",
      "Rural Area"
    ],
    "Nandyal": [
      "Nandyal City",
      "Nandyal Town",
      "Rural Area"
    ],
    "Ntr": [
      "Ntr City",
      "Ntr Town",
      "Rural Area"
    ],
    "Palnadu": [
      "Palnadu City",
      "Palnadu Town",
      "Rural Area"
    ],
    "Parvathipuram Manyam": [
      "Parvathipuram Manyam City",
      "Parvathipuram Manyam Town",
      "Rural Area"
    ],
    "Polavaram": [
      "Polavaram City",
      "Polavaram Town",
      "Rural Area"
    ],
    "Prakasam": [
      "Prakasam City",
      "Prakasam Town",
      "Rural Area"
    ],
    "Sri Potti Sriramulu Nellore": [
      "Sri Potti Sriramulu Nellore City",
      "Sri Potti Sriramulu Nellore Town",
      "Rural Area"
    ],
    "Sri Sathya Sai": [
      "Sri Sathya Sai City",
      "Sri Sathya Sai Town",
      "Rural Area"
    ],
    "Srikakulam": [
      "Srikakulam City",
      "Srikakulam Town",
      "Rural Area"
    ],
    "Tirupati": [
      "Tirupati City",
      "Tirupati Town",
      "Rural Area"
    ],
    "Visakhapatnam": [
      "Visakhapatnam City",
      "Visakhapatnam Town",
      "Rural Area"
    ]
  },
  "Arunachal Pradesh": {
    "Anjaw": [
      "Anjaw City",
      "Anjaw Town",
      "Rural Area"
    ],
    "Bichom": [
      "Bichom City",
      "Bichom Town",
      "Rural Area"
    ],
    "Changlang": [
      "Changlang City",
      "Changlang Town",
      "Rural Area"
    ],
    "Dibang Valley": [
      "Dibang Valley City",
      "Dibang Valley Town",
      "Rural Area"
    ],
    "East Kameng": [
      "East Kameng City",
      "East Kameng Town",
      "Rural Area"
    ],
    "East Siang": [
      "East Siang City",
      "East Siang Town",
      "Rural Area"
    ],
    "Kamle": [
      "Kamle City",
      "Kamle Town",
      "Rural Area"
    ],
    "Keyi Panyor": [
      "Keyi Panyor City",
      "Keyi Panyor Town",
      "Rural Area"
    ],
    "Kra Daadi": [
      "Kra Daadi City",
      "Kra Daadi Town",
      "Rural Area"
    ],
    "Kurung Kumey": [
      "Kurung Kumey City",
      "Kurung Kumey Town",
      "Rural Area"
    ],
    "Leparada": [
      "Leparada City",
      "Leparada Town",
      "Rural Area"
    ],
    "Lohit": [
      "Lohit City",
      "Lohit Town",
      "Rural Area"
    ],
    "Longding": [
      "Longding City",
      "Longding Town",
      "Rural Area"
    ],
    "Lower Dibang Valley": [
      "Lower Dibang Valley City",
      "Lower Dibang Valley Town",
      "Rural Area"
    ],
    "Lower Siang": [
      "Lower Siang City",
      "Lower Siang Town",
      "Rural Area"
    ],
    "Lower Subansiri": [
      "Lower Subansiri City",
      "Lower Subansiri Town",
      "Rural Area"
    ],
    "Namsai": [
      "Namsai City",
      "Namsai Town",
      "Rural Area"
    ],
    "Pakke Kessang": [
      "Pakke Kessang City",
      "Pakke Kessang Town",
      "Rural Area"
    ],
    "Papum Pare": [
      "Papum Pare City",
      "Papum Pare Town",
      "Rural Area"
    ],
    "Shi Yomi": [
      "Shi Yomi City",
      "Shi Yomi Town",
      "Rural Area"
    ],
    "Siang": [
      "Siang City",
      "Siang Town",
      "Rural Area"
    ],
    "Tawang": [
      "Tawang City",
      "Tawang Town",
      "Rural Area"
    ],
    "Tirap": [
      "Tirap City",
      "Tirap Town",
      "Rural Area"
    ],
    "Upper Siang": [
      "Upper Siang City",
      "Upper Siang Town",
      "Rural Area"
    ],
    "Upper Subansiri": [
      "Upper Subansiri City",
      "Upper Subansiri Town",
      "Rural Area"
    ]
  },
  "Assam": {
    "Bajali": [
      "Bajali City",
      "Bajali Town",
      "Rural Area"
    ],
    "Baksa": [
      "Baksa City",
      "Baksa Town",
      "Rural Area"
    ],
    "Barpeta": [
      "Barpeta City",
      "Barpeta Town",
      "Rural Area"
    ],
    "Biswanath": [
      "Biswanath City",
      "Biswanath Town",
      "Rural Area"
    ],
    "Bongaigaon": [
      "Bongaigaon City",
      "Bongaigaon Town",
      "Rural Area"
    ],
    "Cachar": [
      "Cachar City",
      "Cachar Town",
      "Rural Area"
    ],
    "Charaideo": [
      "Charaideo City",
      "Charaideo Town",
      "Rural Area"
    ],
    "Chirang": [
      "Chirang City",
      "Chirang Town",
      "Rural Area"
    ],
    "Darrang": [
      "Darrang City",
      "Darrang Town",
      "Rural Area"
    ],
    "Dhemaji": [
      "Dhemaji City",
      "Dhemaji Town",
      "Rural Area"
    ],
    "Dhubri": [
      "Dhubri City",
      "Dhubri Town",
      "Rural Area"
    ],
    "Dibrugarh": [
      "Dibrugarh City",
      "Dibrugarh Town",
      "Rural Area"
    ],
    "Dima Hasao": [
      "Dima Hasao City",
      "Dima Hasao Town",
      "Rural Area"
    ],
    "Goalpara": [
      "Goalpara City",
      "Goalpara Town",
      "Rural Area"
    ],
    "Golaghat": [
      "Golaghat City",
      "Golaghat Town",
      "Rural Area"
    ],
    "Hailakandi": [
      "Hailakandi City",
      "Hailakandi Town",
      "Rural Area"
    ],
    "Hojai": [
      "Hojai City",
      "Hojai Town",
      "Rural Area"
    ],
    "Jorhat": [
      "Jorhat City",
      "Jorhat Town",
      "Rural Area"
    ],
    "Kamrup": [
      "Kamrup City",
      "Kamrup Town",
      "Rural Area"
    ],
    "Kamrup Metro": [
      "Kamrup Metro City",
      "Kamrup Metro Town",
      "Rural Area"
    ],
    "Karbi Anglong": [
      "Karbi Anglong City",
      "Karbi Anglong Town",
      "Rural Area"
    ],
    "Kokrajhar": [
      "Kokrajhar City",
      "Kokrajhar Town",
      "Rural Area"
    ],
    "Lakhimpur": [
      "Lakhimpur City",
      "Lakhimpur Town",
      "Rural Area"
    ],
    "Majuli": [
      "Majuli City",
      "Majuli Town",
      "Rural Area"
    ],
    "Marigaon": [
      "Marigaon City",
      "Marigaon Town",
      "Rural Area"
    ]
  },
  "Bihar": {
    "Araria": [
      "Araria City",
      "Araria Town",
      "Rural Area"
    ],
    "Arwal": [
      "Arwal City",
      "Arwal Town",
      "Rural Area"
    ],
    "Aurangabad": [
      "Aurangabad City",
      "Aurangabad Town",
      "Rural Area"
    ],
    "Banka": [
      "Banka City",
      "Banka Town",
      "Rural Area"
    ],
    "Begusarai": [
      "Begusarai City",
      "Begusarai Town",
      "Rural Area"
    ],
    "Bhagalpur": [
      "Bhagalpur City",
      "Bhagalpur Town",
      "Rural Area"
    ],
    "Bhojpur": [
      "Bhojpur City",
      "Bhojpur Town",
      "Rural Area"
    ],
    "Buxar": [
      "Buxar City",
      "Buxar Town",
      "Rural Area"
    ],
    "Darbhanga": [
      "Darbhanga City",
      "Darbhanga Town",
      "Rural Area"
    ],
    "Gaya": [
      "Gaya City",
      "Gaya Town",
      "Rural Area"
    ],
    "Gopalganj": [
      "Gopalganj City",
      "Gopalganj Town",
      "Rural Area"
    ],
    "Jamui": [
      "Jamui City",
      "Jamui Town",
      "Rural Area"
    ],
    "Jehanabad": [
      "Jehanabad City",
      "Jehanabad Town",
      "Rural Area"
    ],
    "Kaimur (Bhabua)": [
      "Kaimur (Bhabua) City",
      "Kaimur (Bhabua) Town",
      "Rural Area"
    ],
    "Katihar": [
      "Katihar City",
      "Katihar Town",
      "Rural Area"
    ],
    "Khagaria": [
      "Khagaria City",
      "Khagaria Town",
      "Rural Area"
    ],
    "Kishanganj": [
      "Kishanganj City",
      "Kishanganj Town",
      "Rural Area"
    ],
    "Lakhisarai": [
      "Lakhisarai City",
      "Lakhisarai Town",
      "Rural Area"
    ],
    "Madhepura": [
      "Madhepura City",
      "Madhepura Town",
      "Rural Area"
    ],
    "Madhubani": [
      "Madhubani City",
      "Madhubani Town",
      "Rural Area"
    ],
    "Munger": [
      "Munger City",
      "Munger Town",
      "Rural Area"
    ],
    "Muzaffarpur": [
      "Muzaffarpur City",
      "Muzaffarpur Town",
      "Rural Area"
    ],
    "Nalanda": [
      "Nalanda City",
      "Nalanda Town",
      "Rural Area"
    ],
    "Nawada": [
      "Nawada City",
      "Nawada Town",
      "Rural Area"
    ],
    "Pashchim Champaran": [
      "Pashchim Champaran City",
      "Pashchim Champaran Town",
      "Rural Area"
    ],
    "Patna": [
      "Patna City",
      "Patna Town",
      "Rural Area"
    ],
    "Purnia": [
      "Purnia City",
      "Purnia Town",
      "Rural Area"
    ],
    "Rohtas": [
      "Rohtas City",
      "Rohtas Town",
      "Rural Area"
    ],
    "Saharsa": [
      "Saharsa City",
      "Saharsa Town",
      "Rural Area"
    ],
    "Samastipur": [
      "Samastipur City",
      "Samastipur Town",
      "Rural Area"
    ],
    "Saran": [
      "Saran City",
      "Saran Town",
      "Rural Area"
    ],
    "Sheikhpura": [
      "Sheikhpura City",
      "Sheikhpura Town",
      "Rural Area"
    ],
    "Sheohar": [
      "Sheohar City",
      "Sheohar Town",
      "Rural Area"
    ],
    "Sitamarhi": [
      "Sitamarhi City",
      "Sitamarhi Town",
      "Rural Area"
    ],
    "Siwan": [
      "Siwan City",
      "Siwan Town",
      "Rural Area"
    ],
    "Supaul": [
      "Supaul City",
      "Supaul Town",
      "Rural Area"
    ],
    "Vaishali": [
      "Vaishali City",
      "Vaishali Town",
      "Rural Area"
    ]
  },
  "Chandigarh": {
    "Chandigarh": [
      "Chandigarh City",
      "Chandigarh Town",
      "Rural Area"
    ]
  },
  "Chhattisgarh": {
    "Balod": [
      "Balod City",
      "Balod Town",
      "Rural Area"
    ],
    "Balodabazar-Bhatapara": [
      "Balodabazar-Bhatapara City",
      "Balodabazar-Bhatapara Town",
      "Rural Area"
    ],
    "Balrampur-Ramanujganj": [
      "Balrampur-Ramanujganj City",
      "Balrampur-Ramanujganj Town",
      "Rural Area"
    ],
    "Bastar": [
      "Bastar City",
      "Bastar Town",
      "Rural Area"
    ],
    "Bemetara": [
      "Bemetara City",
      "Bemetara Town",
      "Rural Area"
    ],
    "Bijapur": [
      "Bijapur City",
      "Bijapur Town",
      "Rural Area"
    ],
    "Bilaspur": [
      "Bilaspur City",
      "Bilaspur Town",
      "Rural Area"
    ],
    "Dakshin Bastar Dantewada": [
      "Dakshin Bastar Dantewada City",
      "Dakshin Bastar Dantewada Town",
      "Rural Area"
    ],
    "Dhamtari": [
      "Dhamtari City",
      "Dhamtari Town",
      "Rural Area"
    ],
    "Durg": [
      "Durg City",
      "Durg Town",
      "Rural Area"
    ],
    "Gariyaband": [
      "Gariyaband City",
      "Gariyaband Town",
      "Rural Area"
    ],
    "Gaurela-Pendra-Marwahi": [
      "Gaurela-Pendra-Marwahi City",
      "Gaurela-Pendra-Marwahi Town",
      "Rural Area"
    ],
    "Janjgir-Champa": [
      "Janjgir-Champa City",
      "Janjgir-Champa Town",
      "Rural Area"
    ],
    "Jashpur": [
      "Jashpur City",
      "Jashpur Town",
      "Rural Area"
    ],
    "Kabeerdham": [
      "Kabeerdham City",
      "Kabeerdham Town",
      "Rural Area"
    ],
    "Khairagarh-Chhuikhadan-Gandai": [
      "Khairagarh-Chhuikhadan-Gandai City",
      "Khairagarh-Chhuikhadan-Gandai Town",
      "Rural Area"
    ],
    "Kondagaon": [
      "Kondagaon City",
      "Kondagaon Town",
      "Rural Area"
    ],
    "Korba": [
      "Korba City",
      "Korba Town",
      "Rural Area"
    ],
    "Korea": [
      "Korea City",
      "Korea Town",
      "Rural Area"
    ],
    "Mahasamund": [
      "Mahasamund City",
      "Mahasamund Town",
      "Rural Area"
    ],
    "Manendragarh-Chirmiri-Bharatpur(M C B)": [
      "Manendragarh-Chirmiri-Bharatpur(M C B) City",
      "Manendragarh-Chirmiri-Bharatpur(M C B) Town",
      "Rural Area"
    ],
    "Mohla-Manpur-Ambagarh Chouki": [
      "Mohla-Manpur-Ambagarh Chouki City",
      "Mohla-Manpur-Ambagarh Chouki Town",
      "Rural Area"
    ],
    "Mungeli": [
      "Mungeli City",
      "Mungeli Town",
      "Rural Area"
    ],
    "Narayanpur": [
      "Narayanpur City",
      "Narayanpur Town",
      "Rural Area"
    ],
    "Raigarh": [
      "Raigarh City",
      "Raigarh Town",
      "Rural Area"
    ]
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    "Dadra And Nagar Haveli": [
      "Dadra And Nagar Haveli City",
      "Dadra And Nagar Haveli Town",
      "Rural Area"
    ],
    "Daman": [
      "Daman City",
      "Daman Town",
      "Rural Area"
    ],
    "Diu": [
      "Diu City",
      "Diu Town",
      "Rural Area"
    ]
  },
  "Delhi": {
    "Central": [
      "Central City",
      "Central Town",
      "Rural Area"
    ],
    "East": [
      "East City",
      "East Town",
      "Rural Area"
    ],
    "New Delhi": [
      "New Delhi City",
      "New Delhi Town",
      "Rural Area"
    ],
    "North": [
      "North City",
      "North Town",
      "Rural Area"
    ],
    "North East": [
      "North East City",
      "North East Town",
      "Rural Area"
    ],
    "North West": [
      "North West City",
      "North West Town",
      "Rural Area"
    ],
    "Shahdara": [
      "Shahdara City",
      "Shahdara Town",
      "Rural Area"
    ],
    "South": [
      "South City",
      "South Town",
      "Rural Area"
    ],
    "South East": [
      "South East City",
      "South East Town",
      "Rural Area"
    ],
    "South West": [
      "South West City",
      "South West Town",
      "Rural Area"
    ],
    "West": [
      "West City",
      "West Town",
      "Rural Area"
    ]
  },
  "Goa": {
    "Kushavati": [
      "Kushavati City",
      "Kushavati Town",
      "Rural Area"
    ],
    "North Goa": [
      "North Goa City",
      "North Goa Town",
      "Rural Area"
    ],
    "South Goa": [
      "South Goa City",
      "South Goa Town",
      "Rural Area"
    ]
  },
  "Gujarat": {
    "Ahmedabad": [
      "Ahmedabad City",
      "Ahmedabad Town",
      "Rural Area"
    ],
    "Amreli": [
      "Amreli City",
      "Amreli Town",
      "Rural Area"
    ],
    "Anand": [
      "Anand City",
      "Anand Town",
      "Rural Area"
    ],
    "Arvalli": [
      "Arvalli City",
      "Arvalli Town",
      "Rural Area"
    ],
    "Banas Kantha": [
      "Banas Kantha City",
      "Banas Kantha Town",
      "Rural Area"
    ],
    "Bharuch": [
      "Bharuch City",
      "Bharuch Town",
      "Rural Area"
    ],
    "Bhavnagar": [
      "Bhavnagar City",
      "Bhavnagar Town",
      "Rural Area"
    ],
    "Botad": [
      "Botad City",
      "Botad Town",
      "Rural Area"
    ],
    "Chhotaudepur": [
      "Chhotaudepur City",
      "Chhotaudepur Town",
      "Rural Area"
    ],
    "Dahod": [
      "Dahod City",
      "Dahod Town",
      "Rural Area"
    ],
    "Dangs": [
      "Dangs City",
      "Dangs Town",
      "Rural Area"
    ],
    "Devbhumi Dwarka": [
      "Devbhumi Dwarka City",
      "Devbhumi Dwarka Town",
      "Rural Area"
    ],
    "Gandhinagar": [
      "Gandhinagar City",
      "Gandhinagar Town",
      "Rural Area"
    ],
    "Gir Somnath": [
      "Gir Somnath City",
      "Gir Somnath Town",
      "Rural Area"
    ],
    "Jamnagar": [
      "Jamnagar City",
      "Jamnagar Town",
      "Rural Area"
    ],
    "Junagadh": [
      "Junagadh City",
      "Junagadh Town",
      "Rural Area"
    ],
    "Kachchh": [
      "Kachchh City",
      "Kachchh Town",
      "Rural Area"
    ],
    "Kheda": [
      "Kheda City",
      "Kheda Town",
      "Rural Area"
    ],
    "Mahesana": [
      "Mahesana City",
      "Mahesana Town",
      "Rural Area"
    ],
    "Mahisagar": [
      "Mahisagar City",
      "Mahisagar Town",
      "Rural Area"
    ],
    "Morbi": [
      "Morbi City",
      "Morbi Town",
      "Rural Area"
    ],
    "Narmada": [
      "Narmada City",
      "Narmada Town",
      "Rural Area"
    ],
    "Navsari": [
      "Navsari City",
      "Navsari Town",
      "Rural Area"
    ],
    "Panch Mahals": [
      "Panch Mahals City",
      "Panch Mahals Town",
      "Rural Area"
    ],
    "Patan": [
      "Patan City",
      "Patan Town",
      "Rural Area"
    ]
  },
  "Haryana": {
    "Ambala": [
      "Ambala City",
      "Ambala Town",
      "Rural Area"
    ],
    "Bhiwani": [
      "Bhiwani City",
      "Bhiwani Town",
      "Rural Area"
    ],
    "Charkhi Dadri": [
      "Charkhi Dadri City",
      "Charkhi Dadri Town",
      "Rural Area"
    ],
    "Faridabad": [
      "Faridabad City",
      "Faridabad Town",
      "Rural Area"
    ],
    "Fatehabad": [
      "Fatehabad City",
      "Fatehabad Town",
      "Rural Area"
    ],
    "Gurugram": [
      "Gurugram City",
      "Gurugram Town",
      "Rural Area"
    ],
    "Hansi": [
      "Hansi City",
      "Hansi Town",
      "Rural Area"
    ],
    "Hisar": [
      "Hisar City",
      "Hisar Town",
      "Rural Area"
    ],
    "Jhajjar": [
      "Jhajjar City",
      "Jhajjar Town",
      "Rural Area"
    ],
    "Jind": [
      "Jind City",
      "Jind Town",
      "Rural Area"
    ],
    "Kaithal": [
      "Kaithal City",
      "Kaithal Town",
      "Rural Area"
    ],
    "Karnal": [
      "Karnal City",
      "Karnal Town",
      "Rural Area"
    ],
    "Kurukshetra": [
      "Kurukshetra City",
      "Kurukshetra Town",
      "Rural Area"
    ],
    "Mahendragarh": [
      "Mahendragarh City",
      "Mahendragarh Town",
      "Rural Area"
    ],
    "Nuh": [
      "Nuh City",
      "Nuh Town",
      "Rural Area"
    ],
    "Palwal": [
      "Palwal City",
      "Palwal Town",
      "Rural Area"
    ],
    "Panchkula": [
      "Panchkula City",
      "Panchkula Town",
      "Rural Area"
    ],
    "Panipat": [
      "Panipat City",
      "Panipat Town",
      "Rural Area"
    ],
    "Rewari": [
      "Rewari City",
      "Rewari Town",
      "Rural Area"
    ],
    "Rohtak": [
      "Rohtak City",
      "Rohtak Town",
      "Rural Area"
    ],
    "Sirsa": [
      "Sirsa City",
      "Sirsa Town",
      "Rural Area"
    ],
    "Sonipat": [
      "Sonipat City",
      "Sonipat Town",
      "Rural Area"
    ],
    "Yamunanagar": [
      "Yamunanagar City",
      "Yamunanagar Town",
      "Rural Area"
    ]
  },
  "Himachal Pradesh": {
    "Bilaspur": [
      "Bilaspur City",
      "Bilaspur Town",
      "Rural Area"
    ],
    "Chamba": [
      "Chamba City",
      "Chamba Town",
      "Rural Area"
    ],
    "Hamirpur": [
      "Hamirpur City",
      "Hamirpur Town",
      "Rural Area"
    ],
    "Kangra": [
      "Kangra City",
      "Kangra Town",
      "Rural Area"
    ],
    "Kinnaur": [
      "Kinnaur City",
      "Kinnaur Town",
      "Rural Area"
    ],
    "Kullu": [
      "Kullu City",
      "Kullu Town",
      "Rural Area"
    ],
    "Lahaul And Spiti": [
      "Lahaul And Spiti City",
      "Lahaul And Spiti Town",
      "Rural Area"
    ],
    "Mandi": [
      "Mandi City",
      "Mandi Town",
      "Rural Area"
    ],
    "Shimla": [
      "Shimla City",
      "Shimla Town",
      "Rural Area"
    ],
    "Sirmaur": [
      "Sirmaur City",
      "Sirmaur Town",
      "Rural Area"
    ],
    "Solan": [
      "Solan City",
      "Solan Town",
      "Rural Area"
    ],
    "Una": [
      "Una City",
      "Una Town",
      "Rural Area"
    ]
  },
  "Jammu and Kashmir": {
    "Anantnag": [
      "Anantnag City",
      "Anantnag Town",
      "Rural Area"
    ],
    "Bandipora": [
      "Bandipora City",
      "Bandipora Town",
      "Rural Area"
    ],
    "Baramulla": [
      "Baramulla City",
      "Baramulla Town",
      "Rural Area"
    ],
    "Budgam": [
      "Budgam City",
      "Budgam Town",
      "Rural Area"
    ],
    "Doda": [
      "Doda City",
      "Doda Town",
      "Rural Area"
    ],
    "Ganderbal": [
      "Ganderbal City",
      "Ganderbal Town",
      "Rural Area"
    ],
    "Jammu": [
      "Jammu City",
      "Jammu Town",
      "Rural Area"
    ],
    "Kathua": [
      "Kathua City",
      "Kathua Town",
      "Rural Area"
    ],
    "Kishtwar": [
      "Kishtwar City",
      "Kishtwar Town",
      "Rural Area"
    ],
    "Kulgam": [
      "Kulgam City",
      "Kulgam Town",
      "Rural Area"
    ],
    "Kupwara": [
      "Kupwara City",
      "Kupwara Town",
      "Rural Area"
    ],
    "Poonch": [
      "Poonch City",
      "Poonch Town",
      "Rural Area"
    ],
    "Pulwama": [
      "Pulwama City",
      "Pulwama Town",
      "Rural Area"
    ],
    "Rajouri": [
      "Rajouri City",
      "Rajouri Town",
      "Rural Area"
    ],
    "Ramban": [
      "Ramban City",
      "Ramban Town",
      "Rural Area"
    ],
    "Reasi": [
      "Reasi City",
      "Reasi Town",
      "Rural Area"
    ],
    "Samba": [
      "Samba City",
      "Samba Town",
      "Rural Area"
    ],
    "Shopian": [
      "Shopian City",
      "Shopian Town",
      "Rural Area"
    ],
    "Srinagar": [
      "Srinagar City",
      "Srinagar Town",
      "Rural Area"
    ],
    "Udhampur": [
      "Udhampur City",
      "Udhampur Town",
      "Rural Area"
    ]
  },
  "Jharkhand": {
    "Bokaro": [
      "Bokaro City",
      "Bokaro Town",
      "Rural Area"
    ],
    "Chatra": [
      "Chatra City",
      "Chatra Town",
      "Rural Area"
    ],
    "Deoghar": [
      "Deoghar City",
      "Deoghar Town",
      "Rural Area"
    ],
    "Dhanbad": [
      "Dhanbad City",
      "Dhanbad Town",
      "Rural Area"
    ],
    "Dumka": [
      "Dumka City",
      "Dumka Town",
      "Rural Area"
    ],
    "East Singhbum": [
      "East Singhbum City",
      "East Singhbum Town",
      "Rural Area"
    ],
    "Garhwa": [
      "Garhwa City",
      "Garhwa Town",
      "Rural Area"
    ],
    "Giridih": [
      "Giridih City",
      "Giridih Town",
      "Rural Area"
    ],
    "Godda": [
      "Godda City",
      "Godda Town",
      "Rural Area"
    ],
    "Gumla": [
      "Gumla City",
      "Gumla Town",
      "Rural Area"
    ],
    "Hazaribagh": [
      "Hazaribagh City",
      "Hazaribagh Town",
      "Rural Area"
    ],
    "Jamtara": [
      "Jamtara City",
      "Jamtara Town",
      "Rural Area"
    ],
    "Khunti": [
      "Khunti City",
      "Khunti Town",
      "Rural Area"
    ],
    "Koderma": [
      "Koderma City",
      "Koderma Town",
      "Rural Area"
    ],
    "Latehar": [
      "Latehar City",
      "Latehar Town",
      "Rural Area"
    ],
    "Lohardaga": [
      "Lohardaga City",
      "Lohardaga Town",
      "Rural Area"
    ],
    "Pakur": [
      "Pakur City",
      "Pakur Town",
      "Rural Area"
    ],
    "Palamu": [
      "Palamu City",
      "Palamu Town",
      "Rural Area"
    ],
    "Ramgarh": [
      "Ramgarh City",
      "Ramgarh Town",
      "Rural Area"
    ],
    "Ranchi": [
      "Ranchi City",
      "Ranchi Town",
      "Rural Area"
    ],
    "Sahebganj": [
      "Sahebganj City",
      "Sahebganj Town",
      "Rural Area"
    ],
    "Saraikela Kharsawan": [
      "Saraikela Kharsawan City",
      "Saraikela Kharsawan Town",
      "Rural Area"
    ],
    "Simdega": [
      "Simdega City",
      "Simdega Town",
      "Rural Area"
    ],
    "West Singhbhum": [
      "West Singhbhum City",
      "West Singhbhum Town",
      "Rural Area"
    ]
  },
  "Karnataka": {
    "Bagalkote": [
      "Bagalkote City",
      "Bagalkote Town",
      "Rural Area"
    ],
    "Ballari": [
      "Ballari City",
      "Ballari Town",
      "Rural Area"
    ],
    "Belagavi": [
      "Belagavi City",
      "Belagavi Town",
      "Rural Area"
    ],
    "Bengaluru Rural": [
      "Bengaluru Rural City",
      "Bengaluru Rural Town",
      "Rural Area"
    ],
    "Bengaluru South": [
      "Bengaluru South City",
      "Bengaluru South Town",
      "Rural Area"
    ],
    "Bengaluru Urban": [
      "Bengaluru Urban City",
      "Bengaluru Urban Town",
      "Rural Area"
    ],
    "Bidar": [
      "Bidar City",
      "Bidar Town",
      "Rural Area"
    ],
    "Chamarajanagar": [
      "Chamarajanagar City",
      "Chamarajanagar Town",
      "Rural Area"
    ],
    "Chikkaballapura": [
      "Chikkaballapura City",
      "Chikkaballapura Town",
      "Rural Area"
    ],
    "Chikkamagaluru": [
      "Chikkamagaluru City",
      "Chikkamagaluru Town",
      "Rural Area"
    ],
    "Chitradurga": [
      "Chitradurga City",
      "Chitradurga Town",
      "Rural Area"
    ],
    "Dakshina Kannada": [
      "Dakshina Kannada City",
      "Dakshina Kannada Town",
      "Rural Area"
    ],
    "Davanagere": [
      "Davanagere City",
      "Davanagere Town",
      "Rural Area"
    ],
    "Dharwad": [
      "Dharwad City",
      "Dharwad Town",
      "Rural Area"
    ],
    "Gadag": [
      "Gadag City",
      "Gadag Town",
      "Rural Area"
    ],
    "Hassan": [
      "Hassan City",
      "Hassan Town",
      "Rural Area"
    ],
    "Haveri": [
      "Haveri City",
      "Haveri Town",
      "Rural Area"
    ],
    "Kalaburagi": [
      "Kalaburagi City",
      "Kalaburagi Town",
      "Rural Area"
    ],
    "Kodagu": [
      "Kodagu City",
      "Kodagu Town",
      "Rural Area"
    ],
    "Kolar": [
      "Kolar City",
      "Kolar Town",
      "Rural Area"
    ],
    "Koppal": [
      "Koppal City",
      "Koppal Town",
      "Rural Area"
    ],
    "Mandya": [
      "Mandya City",
      "Mandya Town",
      "Rural Area"
    ],
    "Mysuru": [
      "Mysuru City",
      "Mysuru Town",
      "Rural Area"
    ],
    "Raichur": [
      "Raichur City",
      "Raichur Town",
      "Rural Area"
    ],
    "Shivamogga": [
      "Shivamogga City",
      "Shivamogga Town",
      "Rural Area"
    ]
  },
  "Kerala": {
    "Alappuzha": [
      "Alappuzha City",
      "Alappuzha Town",
      "Rural Area"
    ],
    "Ernakulam": [
      "Ernakulam City",
      "Ernakulam Town",
      "Rural Area"
    ],
    "Idukki": [
      "Idukki City",
      "Idukki Town",
      "Rural Area"
    ],
    "Kannur": [
      "Kannur City",
      "Kannur Town",
      "Rural Area"
    ],
    "Kasaragod": [
      "Kasaragod City",
      "Kasaragod Town",
      "Rural Area"
    ],
    "Kollam": [
      "Kollam City",
      "Kollam Town",
      "Rural Area"
    ],
    "Kottayam": [
      "Kottayam City",
      "Kottayam Town",
      "Rural Area"
    ],
    "Kozhikode": [
      "Kozhikode City",
      "Kozhikode Town",
      "Rural Area"
    ],
    "Malappuram": [
      "Malappuram City",
      "Malappuram Town",
      "Rural Area"
    ],
    "Palakkad": [
      "Palakkad City",
      "Palakkad Town",
      "Rural Area"
    ],
    "Pathanamthitta": [
      "Pathanamthitta City",
      "Pathanamthitta Town",
      "Rural Area"
    ],
    "Thiruvananthapuram": [
      "Thiruvananthapuram City",
      "Thiruvananthapuram Town",
      "Rural Area"
    ],
    "Thrissur": [
      "Thrissur City",
      "Thrissur Town",
      "Rural Area"
    ],
    "Wayanad": [
      "Wayanad City",
      "Wayanad Town",
      "Rural Area"
    ]
  },
  "Ladakh": {
    "Kargil": [
      "Kargil City",
      "Kargil Town",
      "Rural Area"
    ],
    "Leh Ladakh": [
      "Leh Ladakh City",
      "Leh Ladakh Town",
      "Rural Area"
    ]
  },
  "Lakshadweep": {
    "Lakshadweep District": [
      "Lakshadweep District City",
      "Lakshadweep District Town",
      "Rural Area"
    ]
  },
  "Madhya Pradesh": {
    "Agar-Malwa": [
      "Agar-Malwa City",
      "Agar-Malwa Town",
      "Rural Area"
    ],
    "Alirajpur": [
      "Alirajpur City",
      "Alirajpur Town",
      "Rural Area"
    ],
    "Anuppur": [
      "Anuppur City",
      "Anuppur Town",
      "Rural Area"
    ],
    "Ashoknagar": [
      "Ashoknagar City",
      "Ashoknagar Town",
      "Rural Area"
    ],
    "Balaghat": [
      "Balaghat City",
      "Balaghat Town",
      "Rural Area"
    ],
    "Barwani": [
      "Barwani City",
      "Barwani Town",
      "Rural Area"
    ],
    "Betul": [
      "Betul City",
      "Betul Town",
      "Rural Area"
    ],
    "Bhind": [
      "Bhind City",
      "Bhind Town",
      "Rural Area"
    ],
    "Bhopal": [
      "Bhopal City",
      "Bhopal Town",
      "Rural Area"
    ],
    "Burhanpur": [
      "Burhanpur City",
      "Burhanpur Town",
      "Rural Area"
    ],
    "Chhatarpur": [
      "Chhatarpur City",
      "Chhatarpur Town",
      "Rural Area"
    ],
    "Chhindwara": [
      "Chhindwara City",
      "Chhindwara Town",
      "Rural Area"
    ],
    "Damoh": [
      "Damoh City",
      "Damoh Town",
      "Rural Area"
    ],
    "Datia": [
      "Datia City",
      "Datia Town",
      "Rural Area"
    ],
    "Dewas": [
      "Dewas City",
      "Dewas Town",
      "Rural Area"
    ],
    "Dhar": [
      "Dhar City",
      "Dhar Town",
      "Rural Area"
    ],
    "Dindori": [
      "Dindori City",
      "Dindori Town",
      "Rural Area"
    ],
    "Guna": [
      "Guna City",
      "Guna Town",
      "Rural Area"
    ],
    "Gwalior": [
      "Gwalior City",
      "Gwalior Town",
      "Rural Area"
    ],
    "Harda": [
      "Harda City",
      "Harda Town",
      "Rural Area"
    ],
    "Indore": [
      "Indore City",
      "Indore Town",
      "Rural Area"
    ],
    "Jabalpur": [
      "Jabalpur City",
      "Jabalpur Town",
      "Rural Area"
    ],
    "Jhabua": [
      "Jhabua City",
      "Jhabua Town",
      "Rural Area"
    ],
    "Katni": [
      "Katni City",
      "Katni Town",
      "Rural Area"
    ],
    "Khandwa (East Nimar)": [
      "Khandwa (East Nimar) City",
      "Khandwa (East Nimar) Town",
      "Rural Area"
    ]
  },
  "Maharashtra": {
    "Ahilyanagar": [
      "Ahilyanagar City",
      "Ahilyanagar Town",
      "Rural Area"
    ],
    "Akola": [
      "Akola City",
      "Akola Town",
      "Rural Area"
    ],
    "Amravati": [
      "Amravati City",
      "Amravati Town",
      "Rural Area"
    ],
    "Beed": [
      "Beed City",
      "Beed Town",
      "Rural Area"
    ],
    "Bhandara": [
      "Bhandara City",
      "Bhandara Town",
      "Rural Area"
    ],
    "Buldhana": [
      "Buldhana City",
      "Buldhana Town",
      "Rural Area"
    ],
    "Chandpur": [
      "Chandpur City",
      "Chandpur Town",
      "Rural Area"
    ],
    "Chhatrapati Sambhajinagar": [
      "Chhatrapati Sambhajinagar City",
      "Chhatrapati Sambhajinagar Town",
      "Rural Area"
    ],
    "Dharashiv": [
      "Dharashiv City",
      "Dharashiv Town",
      "Rural Area"
    ],
    "Dhule": [
      "Dhule City",
      "Dhule Town",
      "Rural Area"
    ],
    "Gadchiroli": [
      "Gadchiroli City",
      "Gadchiroli Town",
      "Rural Area"
    ],
    "Gondia": [
      "Gondia City",
      "Gondia Town",
      "Rural Area"
    ],
    "Hingoli": [
      "Hingoli City",
      "Hingoli Town",
      "Rural Area"
    ],
    "Jalgaon": [
      "Jalgaon City",
      "Jalgaon Town",
      "Rural Area"
    ],
    "Jalna": [
      "Jalna City",
      "Jalna Town",
      "Rural Area"
    ],
    "Kolhapur": [
      "Kolhapur City",
      "Kolhapur Town",
      "Rural Area"
    ],
    "Latur": [
      "Latur City",
      "Latur Town",
      "Rural Area"
    ],
    "Mumbai": [
      "Mumbai City",
      "Mumbai Town",
      "Rural Area"
    ],
    "Mumbai Suburban": [
      "Mumbai Suburban City",
      "Mumbai Suburban Town",
      "Rural Area"
    ],
    "Nagpur": [
      "Nagpur City",
      "Nagpur Town",
      "Rural Area"
    ],
    "Nanded": [
      "Nanded City",
      "Nanded Town",
      "Rural Area"
    ],
    "Nandurbar": [
      "Nandurbar City",
      "Nandurbar Town",
      "Rural Area"
    ],
    "Nashik": [
      "Nashik City",
      "Nashik Town",
      "Rural Area"
    ],
    "Palghar": [
      "Palghar City",
      "Palghar Town",
      "Rural Area"
    ],
    "Parbhani": [
      "Parbhani City",
      "Parbhani Town",
      "Rural Area"
    ]
  },
  "Manipur": {
    "Bishnupur": [
      "Bishnupur City",
      "Bishnupur Town",
      "Rural Area"
    ],
    "Chandel": [
      "Chandel City",
      "Chandel Town",
      "Rural Area"
    ],
    "Churachandpur": [
      "Churachandpur City",
      "Churachandpur Town",
      "Rural Area"
    ],
    "Imphal East": [
      "Imphal East City",
      "Imphal East Town",
      "Rural Area"
    ],
    "Imphal West": [
      "Imphal West City",
      "Imphal West Town",
      "Rural Area"
    ],
    "Jiribam": [
      "Jiribam City",
      "Jiribam Town",
      "Rural Area"
    ],
    "Kakching": [
      "Kakching City",
      "Kakching Town",
      "Rural Area"
    ],
    "Kamjong": [
      "Kamjong City",
      "Kamjong Town",
      "Rural Area"
    ],
    "Kangpokpi": [
      "Kangpokpi City",
      "Kangpokpi Town",
      "Rural Area"
    ],
    "Noney": [
      "Noney City",
      "Noney Town",
      "Rural Area"
    ],
    "Pherzawl": [
      "Pherzawl City",
      "Pherzawl Town",
      "Rural Area"
    ],
    "Senapati": [
      "Senapati City",
      "Senapati Town",
      "Rural Area"
    ],
    "Tamenglong": [
      "Tamenglong City",
      "Tamenglong Town",
      "Rural Area"
    ],
    "Tengnoupal": [
      "Tengnoupal City",
      "Tengnoupal Town",
      "Rural Area"
    ],
    "Thoubal": [
      "Thoubal City",
      "Thoubal Town",
      "Rural Area"
    ],
    "Ukhrul": [
      "Ukhrul City",
      "Ukhrul Town",
      "Rural Area"
    ]
  },
  "Meghalaya": {
    "East Garo Hills": [
      "East Garo Hills City",
      "East Garo Hills Town",
      "Rural Area"
    ],
    "East Jaintia Hills": [
      "East Jaintia Hills City",
      "East Jaintia Hills Town",
      "Rural Area"
    ],
    "East Khasi Hills": [
      "East Khasi Hills City",
      "East Khasi Hills Town",
      "Rural Area"
    ],
    "Eastern West Khasi Hills": [
      "Eastern West Khasi Hills City",
      "Eastern West Khasi Hills Town",
      "Rural Area"
    ],
    "North Garo Hills": [
      "North Garo Hills City",
      "North Garo Hills Town",
      "Rural Area"
    ],
    "Ri Bhoi": [
      "Ri Bhoi City",
      "Ri Bhoi Town",
      "Rural Area"
    ],
    "South Garo Hills": [
      "South Garo Hills City",
      "South Garo Hills Town",
      "Rural Area"
    ],
    "South West Garo Hills": [
      "South West Garo Hills City",
      "South West Garo Hills Town",
      "Rural Area"
    ],
    "South West Khasi Hills": [
      "South West Khasi Hills City",
      "South West Khasi Hills Town",
      "Rural Area"
    ],
    "West Garo Hills": [
      "West Garo Hills City",
      "West Garo Hills Town",
      "Rural Area"
    ],
    "West Jaintia Hills": [
      "West Jaintia Hills City",
      "West Jaintia Hills Town",
      "Rural Area"
    ],
    "West Khasi Hills": [
      "West Khasi Hills City",
      "West Khasi Hills Town",
      "Rural Area"
    ]
  },
  "Mizoram": {
    "Aizawl": [
      "Aizawl City",
      "Aizawl Town",
      "Rural Area"
    ],
    "Champhai": [
      "Champhai City",
      "Champhai Town",
      "Rural Area"
    ],
    "Hnahthial": [
      "Hnahthial City",
      "Hnahthial Town",
      "Rural Area"
    ],
    "Khawzawl": [
      "Khawzawl City",
      "Khawzawl Town",
      "Rural Area"
    ],
    "Kolasib": [
      "Kolasib City",
      "Kolasib Town",
      "Rural Area"
    ],
    "Lawngtlai": [
      "Lawngtlai City",
      "Lawngtlai Town",
      "Rural Area"
    ],
    "Lunglei": [
      "Lunglei City",
      "Lunglei Town",
      "Rural Area"
    ],
    "Mamit": [
      "Mamit City",
      "Mamit Town",
      "Rural Area"
    ],
    "Saitual": [
      "Saitual City",
      "Saitual Town",
      "Rural Area"
    ],
    "Serchhip": [
      "Serchhip City",
      "Serchhip Town",
      "Rural Area"
    ],
    "Siaha": [
      "Siaha City",
      "Siaha Town",
      "Rural Area"
    ]
  },
  "Nagaland": {
    "Chumoukedima": [
      "Chumoukedima City",
      "Chumoukedima Town",
      "Rural Area"
    ],
    "Dimapur": [
      "Dimapur City",
      "Dimapur Town",
      "Rural Area"
    ],
    "Kiphire": [
      "Kiphire City",
      "Kiphire Town",
      "Rural Area"
    ],
    "Kohima": [
      "Kohima City",
      "Kohima Town",
      "Rural Area"
    ],
    "Longleng": [
      "Longleng City",
      "Longleng Town",
      "Rural Area"
    ],
    "Meluri": [
      "Meluri City",
      "Meluri Town",
      "Rural Area"
    ],
    "Mokokchung": [
      "Mokokchung City",
      "Mokokchung Town",
      "Rural Area"
    ],
    "Mon": [
      "Mon City",
      "Mon Town",
      "Rural Area"
    ],
    "Niuland": [
      "Niuland City",
      "Niuland Town",
      "Rural Area"
    ],
    "Noklak": [
      "Noklak City",
      "Noklak Town",
      "Rural Area"
    ],
    "Peren": [
      "Peren City",
      "Peren Town",
      "Rural Area"
    ],
    "Phek": [
      "Phek City",
      "Phek Town",
      "Rural Area"
    ],
    "Shamator": [
      "Shamator City",
      "Shamator Town",
      "Rural Area"
    ],
    "Tseminyu": [
      "Tseminyu City",
      "Tseminyu Town",
      "Rural Area"
    ],
    "Tuensang": [
      "Tuensang City",
      "Tuensang Town",
      "Rural Area"
    ],
    "Wokha": [
      "Wokha City",
      "Wokha Town",
      "Rural Area"
    ],
    "Zunheboto": [
      "Zunheboto City",
      "Zunheboto Town",
      "Rural Area"
    ]
  },
  "Odisha": {
    "Angul": [
      "Angul City",
      "Angul Town",
      "Rural Area"
    ],
    "Balangir": [
      "Balangir City",
      "Balangir Town",
      "Rural Area"
    ],
    "Balasore": [
      "Balasore City",
      "Balasore Town",
      "Rural Area"
    ],
    "Bargarh": [
      "Bargarh City",
      "Bargarh Town",
      "Rural Area"
    ],
    "Bhadrak": [
      "Bhadrak City",
      "Bhadrak Town",
      "Rural Area"
    ],
    "Boudh": [
      "Boudh City",
      "Boudh Town",
      "Rural Area"
    ],
    "Cuttack": [
      "Cuttack City",
      "Cuttack Town",
      "Rural Area"
    ],
    "Deogarh": [
      "Deogarh City",
      "Deogarh Town",
      "Rural Area"
    ],
    "Dhenkanal": [
      "Dhenkanal City",
      "Dhenkanal Town",
      "Rural Area"
    ],
    "Gajapati": [
      "Gajapati City",
      "Gajapati Town",
      "Rural Area"
    ],
    "Ganjam": [
      "Ganjam City",
      "Ganjam Town",
      "Rural Area"
    ],
    "Jagatsinghapur": [
      "Jagatsinghapur City",
      "Jagatsinghapur Town",
      "Rural Area"
    ],
    "Jajpur": [
      "Jajpur City",
      "Jajpur Town",
      "Rural Area"
    ],
    "Jharsuguda": [
      "Jharsuguda City",
      "Jharsuguda Town",
      "Rural Area"
    ],
    "Kalahandi": [
      "Kalahandi City",
      "Kalahandi Town",
      "Rural Area"
    ],
    "Kandhamal": [
      "Kandhamal City",
      "Kandhamal Town",
      "Rural Area"
    ],
    "Kendrapara": [
      "Kendrapara City",
      "Kendrapara Town",
      "Rural Area"
    ],
    "Keonjhar": [
      "Keonjhar City",
      "Keonjhar Town",
      "Rural Area"
    ],
    "Khordha": [
      "Khordha City",
      "Khordha Town",
      "Rural Area"
    ],
    "Koraput": [
      "Koraput City",
      "Koraput Town",
      "Rural Area"
    ],
    "Malkangiri": [
      "Malkangiri City",
      "Malkangiri Town",
      "Rural Area"
    ],
    "Mayurbhanj": [
      "Mayurbhanj City",
      "Mayurbhanj Town",
      "Rural Area"
    ],
    "Nabarangpur": [
      "Nabarangpur City",
      "Nabarangpur Town",
      "Rural Area"
    ],
    "Nayagarh": [
      "Nayagarh City",
      "Nayagarh Town",
      "Rural Area"
    ],
    "Nuapada": [
      "Nuapada City",
      "Nuapada Town",
      "Rural Area"
    ]
  },
  "Puducherry": {
    "Karaikal": [
      "Karaikal City",
      "Karaikal Town",
      "Rural Area"
    ],
    "Puducherry": [
      "Puducherry City",
      "Puducherry Town",
      "Rural Area"
    ]
  },
  "Punjab": {
    "Amritsar": [
      "Amritsar City",
      "Amritsar Town",
      "Rural Area"
    ],
    "Barnala": [
      "Barnala City",
      "Barnala Town",
      "Rural Area"
    ],
    "Bathinda": [
      "Bathinda City",
      "Bathinda Town",
      "Rural Area"
    ],
    "Faridkot": [
      "Faridkot City",
      "Faridkot Town",
      "Rural Area"
    ],
    "Fatehgarh Sahib": [
      "Fatehgarh Sahib City",
      "Fatehgarh Sahib Town",
      "Rural Area"
    ],
    "Fazilka": [
      "Fazilka City",
      "Fazilka Town",
      "Rural Area"
    ],
    "Ferozepur": [
      "Ferozepur City",
      "Ferozepur Town",
      "Rural Area"
    ],
    "Gurdaspur": [
      "Gurdaspur City",
      "Gurdaspur Town",
      "Rural Area"
    ],
    "Hoshiarpur": [
      "Hoshiarpur City",
      "Hoshiarpur Town",
      "Rural Area"
    ],
    "Jalandhar": [
      "Jalandhar City",
      "Jalandhar Town",
      "Rural Area"
    ],
    "Kapurthala": [
      "Kapurthala City",
      "Kapurthala Town",
      "Rural Area"
    ],
    "Ludhiana": [
      "Ludhiana City",
      "Ludhiana Town",
      "Rural Area"
    ],
    "Malerkotla": [
      "Malerkotla City",
      "Malerkotla Town",
      "Rural Area"
    ],
    "Mansa": [
      "Mansa City",
      "Mansa Town",
      "Rural Area"
    ],
    "Moga": [
      "Moga City",
      "Moga Town",
      "Rural Area"
    ],
    "Pathankot": [
      "Pathankot City",
      "Pathankot Town",
      "Rural Area"
    ],
    "Patiala": [
      "Patiala City",
      "Patiala Town",
      "Rural Area"
    ],
    "Rupnagar": [
      "Rupnagar City",
      "Rupnagar Town",
      "Rural Area"
    ],
    "S.A.S Nagar": [
      "S.A.S Nagar City",
      "S.A.S Nagar Town",
      "Rural Area"
    ],
    "Sangrur": [
      "Sangrur City",
      "Sangrur Town",
      "Rural Area"
    ],
    "Shahid Bhagat Singh Nagar": [
      "Shahid Bhagat Singh Nagar City",
      "Shahid Bhagat Singh Nagar Town",
      "Rural Area"
    ],
    "Sri Muktsar Sahib": [
      "Sri Muktsar Sahib City",
      "Sri Muktsar Sahib Town",
      "Rural Area"
    ],
    "Tarn Taran": [
      "Tarn Taran City",
      "Tarn Taran Town",
      "Rural Area"
    ]
  },
  "Rajasthan": {
    "Ajmer": [
      "Ajmer City",
      "Ajmer Town",
      "Rural Area"
    ],
    "Alwar": [
      "Alwar City",
      "Alwar Town",
      "Rural Area"
    ],
    "Balotra": [
      "Balotra City",
      "Balotra Town",
      "Rural Area"
    ],
    "Banswara": [
      "Banswara City",
      "Banswara Town",
      "Rural Area"
    ],
    "Baran": [
      "Baran City",
      "Baran Town",
      "Rural Area"
    ],
    "Barmer": [
      "Barmer City",
      "Barmer Town",
      "Rural Area"
    ],
    "Beawar": [
      "Beawar City",
      "Beawar Town",
      "Rural Area"
    ],
    "Bharatpur": [
      "Bharatpur City",
      "Bharatpur Town",
      "Rural Area"
    ],
    "Bhilwara": [
      "Bhilwara City",
      "Bhilwara Town",
      "Rural Area"
    ],
    "Bikaner": [
      "Bikaner City",
      "Bikaner Town",
      "Rural Area"
    ],
    "Bundi": [
      "Bundi City",
      "Bundi Town",
      "Rural Area"
    ],
    "Chittorgarh": [
      "Chittorgarh City",
      "Chittorgarh Town",
      "Rural Area"
    ],
    "Churu": [
      "Churu City",
      "Churu Town",
      "Rural Area"
    ],
    "Dausa": [
      "Dausa City",
      "Dausa Town",
      "Rural Area"
    ],
    "Deeg": [
      "Deeg City",
      "Deeg Town",
      "Rural Area"
    ],
    "Dholpur": [
      "Dholpur City",
      "Dholpur Town",
      "Rural Area"
    ],
    "Didwana-Kuchaman": [
      "Didwana-Kuchaman City",
      "Didwana-Kuchaman Town",
      "Rural Area"
    ],
    "Dungarpur": [
      "Dungarpur City",
      "Dungarpur Town",
      "Rural Area"
    ],
    "Ganganagar": [
      "Ganganagar City",
      "Ganganagar Town",
      "Rural Area"
    ],
    "Hanumangarh": [
      "Hanumangarh City",
      "Hanumangarh Town",
      "Rural Area"
    ],
    "Jaipur": [
      "Jaipur City",
      "Jaipur Town",
      "Rural Area"
    ],
    "Jaisalmer": [
      "Jaisalmer City",
      "Jaisalmer Town",
      "Rural Area"
    ],
    "Jalore": [
      "Jalore City",
      "Jalore Town",
      "Rural Area"
    ],
    "Jhalawar": [
      "Jhalawar City",
      "Jhalawar Town",
      "Rural Area"
    ],
    "Jhunjhunu": [
      "Jhunjhunu City",
      "Jhunjhunu Town",
      "Rural Area"
    ]
  },
  "Sikkim": {
    "Gangtok": [
      "Gangtok City",
      "Gangtok Town",
      "Rural Area"
    ],
    "Gyalshing": [
      "Gyalshing City",
      "Gyalshing Town",
      "Rural Area"
    ],
    "Mangan": [
      "Mangan City",
      "Mangan Town",
      "Rural Area"
    ],
    "Namchi": [
      "Namchi City",
      "Namchi Town",
      "Rural Area"
    ],
    "Pakyong": [
      "Pakyong City",
      "Pakyong Town",
      "Rural Area"
    ],
    "Soreng": [
      "Soreng City",
      "Soreng Town",
      "Rural Area"
    ]
  },
  "Tamil Nadu": {
    "Ariyalur": [
      "Ariyalur City",
      "Ariyalur Town",
      "Rural Area"
    ],
    "Chengalpattu": [
      "Chengalpattu City",
      "Chengalpattu Town",
      "Rural Area"
    ],
    "Chennai": [
      "Chennai City",
      "Chennai Town",
      "Rural Area"
    ],
    "Coimbatore": [
      "Coimbatore City",
      "Coimbatore Town",
      "Rural Area"
    ],
    "Cuddalore": [
      "Cuddalore City",
      "Cuddalore Town",
      "Rural Area"
    ],
    "Dharmapuri": [
      "Dharmapuri City",
      "Dharmapuri Town",
      "Rural Area"
    ],
    "Dindigul": [
      "Dindigul City",
      "Dindigul Town",
      "Rural Area"
    ],
    "Erode": [
      "Erode City",
      "Erode Town",
      "Rural Area"
    ],
    "Kallakurichi": [
      "Kallakurichi City",
      "Kallakurichi Town",
      "Rural Area"
    ],
    "Kancheepuram": [
      "Kancheepuram City",
      "Kancheepuram Town",
      "Rural Area"
    ],
    "Kanniyakumari": [
      "Kanniyakumari City",
      "Kanniyakumari Town",
      "Rural Area"
    ],
    "Karur": [
      "Karur City",
      "Karur Town",
      "Rural Area"
    ],
    "Krishnagiri": [
      "Krishnagiri City",
      "Krishnagiri Town",
      "Rural Area"
    ],
    "Madurai": [
      "Madurai City",
      "Madurai Town",
      "Rural Area"
    ],
    "Mayiladuthurai": [
      "Mayiladuthurai City",
      "Mayiladuthurai Town",
      "Rural Area"
    ],
    "Nagapattinam": [
      "Nagapattinam City",
      "Nagapattinam Town",
      "Rural Area"
    ],
    "Namakkal": [
      "Namakkal City",
      "Namakkal Town",
      "Rural Area"
    ],
    "Perambalur": [
      "Perambalur City",
      "Perambalur Town",
      "Rural Area"
    ],
    "Pudukkottai": [
      "Pudukkottai City",
      "Pudukkottai Town",
      "Rural Area"
    ],
    "Ramanathapuram": [
      "Ramanathapuram City",
      "Ramanathapuram Town",
      "Rural Area"
    ],
    "Ranipet": [
      "Ranipet City",
      "Ranipet Town",
      "Rural Area"
    ],
    "Salem": [
      "Salem City",
      "Salem Town",
      "Rural Area"
    ],
    "Sivaganga": [
      "Sivaganga City",
      "Sivaganga Town",
      "Rural Area"
    ],
    "Tenkasi": [
      "Tenkasi City",
      "Tenkasi Town",
      "Rural Area"
    ],
    "Thanjavur": [
      "Thanjavur City",
      "Thanjavur Town",
      "Rural Area"
    ]
  },
  "Telangana": {
    "Adilabad": [
      "Adilabad City",
      "Adilabad Town",
      "Rural Area"
    ],
    "Bhadradri Kothagudem": [
      "Bhadradri Kothagudem City",
      "Bhadradri Kothagudem Town",
      "Rural Area"
    ],
    "Hanumakonda": [
      "Hanumakonda City",
      "Hanumakonda Town",
      "Rural Area"
    ],
    "Hyderabad": [
      "Hyderabad City",
      "Hyderabad Town",
      "Rural Area"
    ],
    "Jagitial": [
      "Jagitial City",
      "Jagitial Town",
      "Rural Area"
    ],
    "Jangoan": [
      "Jangoan City",
      "Jangoan Town",
      "Rural Area"
    ],
    "Jayashankar Bhupalapally": [
      "Jayashankar Bhupalapally City",
      "Jayashankar Bhupalapally Town",
      "Rural Area"
    ],
    "Jogulamba Gadwal": [
      "Jogulamba Gadwal City",
      "Jogulamba Gadwal Town",
      "Rural Area"
    ],
    "Kamareddy": [
      "Kamareddy City",
      "Kamareddy Town",
      "Rural Area"
    ],
    "Karimnagar": [
      "Karimnagar City",
      "Karimnagar Town",
      "Rural Area"
    ],
    "Khammam": [
      "Khammam City",
      "Khammam Town",
      "Rural Area"
    ],
    "Kumuram Bheem Asifabad": [
      "Kumuram Bheem Asifabad City",
      "Kumuram Bheem Asifabad Town",
      "Rural Area"
    ],
    "Mahabubabad": [
      "Mahabubabad City",
      "Mahabubabad Town",
      "Rural Area"
    ],
    "Mahabubnagar": [
      "Mahabubnagar City",
      "Mahabubnagar Town",
      "Rural Area"
    ],
    "Mancherial": [
      "Mancherial City",
      "Mancherial Town",
      "Rural Area"
    ],
    "Medak": [
      "Medak City",
      "Medak Town",
      "Rural Area"
    ],
    "Medchal Malkajgiri": [
      "Medchal Malkajgiri City",
      "Medchal Malkajgiri Town",
      "Rural Area"
    ],
    "Mulugu": [
      "Mulugu City",
      "Mulugu Town",
      "Rural Area"
    ],
    "Nagarkurnool": [
      "Nagarkurnool City",
      "Nagarkurnool Town",
      "Rural Area"
    ],
    "Nalgonda": [
      "Nalgonda City",
      "Nalgonda Town",
      "Rural Area"
    ],
    "Narayanpet": [
      "Narayanpet City",
      "Narayanpet Town",
      "Rural Area"
    ],
    "Nirmal": [
      "Nirmal City",
      "Nirmal Town",
      "Rural Area"
    ],
    "Nizamabad": [
      "Nizamabad City",
      "Nizamabad Town",
      "Rural Area"
    ],
    "Peddapalli": [
      "Peddapalli City",
      "Peddapalli Town",
      "Rural Area"
    ],
    "Rajanna Sircilla": [
      "Rajanna Sircilla City",
      "Rajanna Sircilla Town",
      "Rural Area"
    ]
  },
  "Tripura": {
    "Dhalai": [
      "Dhalai City",
      "Dhalai Town",
      "Rural Area"
    ],
    "Gomati": [
      "Gomati City",
      "Gomati Town",
      "Rural Area"
    ],
    "Khowai": [
      "Khowai City",
      "Khowai Town",
      "Rural Area"
    ],
    "North Tripura": [
      "North Tripura City",
      "North Tripura Town",
      "Rural Area"
    ],
    "Sepahijala": [
      "Sepahijala City",
      "Sepahijala Town",
      "Rural Area"
    ],
    "South Tripura": [
      "South Tripura City",
      "South Tripura Town",
      "Rural Area"
    ],
    "Unakoti": [
      "Unakoti City",
      "Unakoti Town",
      "Rural Area"
    ],
    "West Tripura": [
      "West Tripura City",
      "West Tripura Town",
      "Rural Area"
    ]
  },
  "Uttar Pradesh": {
    "Agra": [
      "Agra City",
      "Agra Town",
      "Rural Area"
    ],
    "Aligarh": [
      "Aligarh City",
      "Aligarh Town",
      "Rural Area"
    ],
    "Ambedkar Nagar": [
      "Ambedkar Nagar City",
      "Ambedkar Nagar Town",
      "Rural Area"
    ],
    "Amethi": [
      "Amethi City",
      "Amethi Town",
      "Rural Area"
    ],
    "Amroha": [
      "Amroha City",
      "Amroha Town",
      "Rural Area"
    ],
    "Auraiya": [
      "Auraiya City",
      "Auraiya Town",
      "Rural Area"
    ],
    "Ayodhya": [
      "Ayodhya City",
      "Ayodhya Town",
      "Rural Area"
    ],
    "Azamgarh": [
      "Azamgarh City",
      "Azamgarh Town",
      "Rural Area"
    ],
    "Baghpat": [
      "Baghpat City",
      "Baghpat Town",
      "Rural Area"
    ],
    "Bahraich": [
      "Bahraich City",
      "Bahraich Town",
      "Rural Area"
    ],
    "Ballia": [
      "Ballia City",
      "Ballia Town",
      "Rural Area"
    ],
    "Balrampur": [
      "Balrampur City",
      "Balrampur Town",
      "Rural Area"
    ],
    "Banda": [
      "Banda City",
      "Banda Town",
      "Rural Area"
    ],
    "Bara Banki": [
      "Bara Banki City",
      "Bara Banki Town",
      "Rural Area"
    ],
    "Bareilly": [
      "Bareilly City",
      "Bareilly Town",
      "Rural Area"
    ],
    "Basti": [
      "Basti City",
      "Basti Town",
      "Rural Area"
    ],
    "Bhadohi": [
      "Bhadohi City",
      "Bhadohi Town",
      "Rural Area"
    ],
    "Bijnor": [
      "Bijnor City",
      "Bijnor Town",
      "Rural Area"
    ],
    "Budaun": [
      "Budaun City",
      "Budaun Town",
      "Rural Area"
    ],
    "Bulandshahr": [
      "Bulandshahr City",
      "Bulandshahr Town",
      "Rural Area"
    ],
    "Chandauli": [
      "Chandauli City",
      "Chandauli Town",
      "Rural Area"
    ],
    "Chitrakoot": [
      "Chitrakoot City",
      "Chitrakoot Town",
      "Rural Area"
    ],
    "Deoria": [
      "Deoria City",
      "Deoria Town",
      "Rural Area"
    ],
    "Etah": [
      "Etah City",
      "Etah Town",
      "Rural Area"
    ],
    "Etawah": [
      "Etawah City",
      "Etawah Town",
      "Rural Area"
    ]
  },
  "Uttarakhand": {
    "Almora": [
      "Almora City",
      "Almora Town",
      "Rural Area"
    ],
    "Bageshwar": [
      "Bageshwar City",
      "Bageshwar Town",
      "Rural Area"
    ],
    "Chamoli": [
      "Chamoli City",
      "Chamoli Town",
      "Rural Area"
    ],
    "Champawat": [
      "Champawat City",
      "Champawat Town",
      "Rural Area"
    ],
    "Dehradun": [
      "Dehradun City",
      "Dehradun Town",
      "Rural Area"
    ],
    "Haridwar": [
      "Haridwar City",
      "Haridwar Town",
      "Rural Area"
    ],
    "Nainital": [
      "Nainital City",
      "Nainital Town",
      "Rural Area"
    ],
    "Pauri Garhwal": [
      "Pauri Garhwal City",
      "Pauri Garhwal Town",
      "Rural Area"
    ],
    "Pithoragarh": [
      "Pithoragarh City",
      "Pithoragarh Town",
      "Rural Area"
    ],
    "Rudraprayag": [
      "Rudraprayag City",
      "Rudraprayag Town",
      "Rural Area"
    ],
    "Tehri Garhwal": [
      "Tehri Garhwal City",
      "Tehri Garhwal Town",
      "Rural Area"
    ],
    "Udham Singh Nagar": [
      "Udham Singh Nagar City",
      "Udham Singh Nagar Town",
      "Rural Area"
    ],
    "Uttarkashi": [
      "Uttarkashi City",
      "Uttarkashi Town",
      "Rural Area"
    ]
  },
  "West Bengal": {
    "Alipurduar": [
      "Alipurduar City",
      "Alipurduar Town",
      "Rural Area"
    ],
    "Bankura": [
      "Bankura City",
      "Bankura Town",
      "Rural Area"
    ],
    "Birbhum": [
      "Birbhum City",
      "Birbhum Town",
      "Rural Area"
    ],
    "Cooch Behar": [
      "Cooch Behar City",
      "Cooch Behar Town",
      "Rural Area"
    ],
    "Dakshin Dinajpur": [
      "Dakshin Dinajpur City",
      "Dakshin Dinajpur Town",
      "Rural Area"
    ],
    "Darjeeling": [
      "Darjeeling City",
      "Darjeeling Town",
      "Rural Area"
    ],
    "Hooghly": [
      "Hooghly City",
      "Hooghly Town",
      "Rural Area"
    ],
    "Howrah": [
      "Howrah City",
      "Howrah Town",
      "Rural Area"
    ],
    "Jalpaiguri": [
      "Jalpaiguri City",
      "Jalpaiguri Town",
      "Rural Area"
    ],
    "Jhargram": [
      "Jhargram City",
      "Jhargram Town",
      "Rural Area"
    ],
    "Kalimpong": [
      "Kalimpong City",
      "Kalimpong Town",
      "Rural Area"
    ],
    "Kolkata": [
      "Kolkata City",
      "Kolkata Town",
      "Rural Area"
    ],
    "Malda": [
      "Malda City",
      "Malda Town",
      "Rural Area"
    ],
    "Murshidabad": [
      "Murshidabad City",
      "Murshidabad Town",
      "Rural Area"
    ],
    "Nadia": [
      "Nadia City",
      "Nadia Town",
      "Rural Area"
    ],
    "North 24 Parganas": [
      "North 24 Parganas City",
      "North 24 Parganas Town",
      "Rural Area"
    ],
    "Paschim Bardhaman": [
      "Paschim Bardhaman City",
      "Paschim Bardhaman Town",
      "Rural Area"
    ],
    "Paschim Medinipur": [
      "Paschim Medinipur City",
      "Paschim Medinipur Town",
      "Rural Area"
    ],
    "Purba Bardhaman": [
      "Purba Bardhaman City",
      "Purba Bardhaman Town",
      "Rural Area"
    ],
    "Purba Medinipur": [
      "Purba Medinipur City",
      "Purba Medinipur Town",
      "Rural Area"
    ],
    "Purulia": [
      "Purulia City",
      "Purulia Town",
      "Rural Area"
    ],
    "South 24 Parganas": [
      "South 24 Parganas City",
      "South 24 Parganas Town",
      "Rural Area"
    ],
    "Uttar Dinajpur": [
      "Uttar Dinajpur City",
      "Uttar Dinajpur Town",
      "Rural Area"
    ]
  }
}

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'CITIZEN' | 'ADMIN' | 'STAFF'>('CITIZEN');
  const [staffCategory, setStaffCategory] = useState<string>('Pothole');
  const [staffArea, setStaffArea] = useState<string>('');
  const [staffPincode, setStaffPincode] = useState<string>('');
  const [staffCity, setStaffCity] = useState<string>('');
  const [staffDistrict, setStaffDistrict] = useState<string>('');
  const [staffState, setStaffState] = useState<string>('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Autofill address based on pincode
  useEffect(() => {
    if (role === 'STAFF' && staffPincode.length === 6) {
      const fetchAddress = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${staffPincode}`);
          const data = await res.json();
          if (data[0].Status === "Success") {
            const details = data[0].PostOffice[0];
            setStaffCity(details.Block || details.Division || '');
            setStaffDistrict(details.District || '');
            setStaffState(details.State || '');
            setStaffArea(details.Name || '');
          }
        } catch (error) {
          console.error("Pincode fetch error:", error);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      fetchAddress();
    }
  }, [staffPincode, role]);
  
  // OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useStore();
  const navigate = useNavigate();
  
  const staffCategories = ['Pothole', 'Streetlight', 'Drainage', 'Garbage', 'Water Supply', 'Electricity', 'Road Damage', 'Other'];

  const getPincodesForCity = (city: string, stateName?: string) => {
    // Determine realistic state prefix
    let prefix = '5'; // Default
    if (stateName) {
      const statePrefixes: Record<string, string> = {
        'Delhi': '1', 'Haryana': '1', 'Punjab': '1', 'Himachal Pradesh': '1', 'Jammu and Kashmir': '1',
        'Uttar Pradesh': '2', 'Uttarakhand': '2',
        'Rajasthan': '3', 'Gujarat': '3',
        'Maharashtra': '4', 'Goa': '4', 'Madhya Pradesh': '4', 'Chhattisgarh': '4',
        'Andhra Pradesh': '5', 'Telangana': '5', 'Karnataka': '5',
        'Tamil Nadu': '6', 'Kerala': '6',
        'West Bengal': '7', 'Odisha': '7',
        'Bihar': '8', 'Jharkhand': '8'
      };
      prefix = statePrefixes[stateName] || '5';
    }
    
    const base = parseInt(prefix) * 100000 + (city.length * 100);
    return [base, base + 1, base + 2, base + 3, base + 4, base + 5].map(String);
  };

  const getWardsForCity = (city: string) => {
    return Array.from({ length: 15 }, (_, i) => `Ward ${i + 1}`);
  };

  // Admin Location States
  const [adminState, setAdminState] = useState('');
  const [adminDistrict, setAdminDistrict] = useState('');
  const [adminCity, setAdminCity] = useState('');
  const [fetchedAdminPincodes, setFetchedAdminPincodes] = useState<string[]>([]);
  const [isFetchingAdminPincodes, setIsFetchingAdminPincodes] = useState(false);
  const [adminSelectedPincodes, setAdminSelectedPincodes] = useState<string[]>([]);
  const [adminSelectedWards, setAdminSelectedWards] = useState<string[]>([]);
  const [showPincodeDropdown, setShowPincodeDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Fetch Pincodes for Admin City
  useEffect(() => {
    if (role === 'ADMIN' && adminCity) {
      const fetchPincodes = async () => {
        setIsFetchingAdminPincodes(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/postoffice/${adminCity}`);
          const data = await res.json();
          if (data[0].Status === "Success") {
            const pincodes = Array.from(new Set(data[0].PostOffice.map((po: any) => po.Pincode)));
            setFetchedAdminPincodes(pincodes.sort() as string[]);
          } else {
            setFetchedAdminPincodes(getPincodesForCity(adminCity, adminState));
          }
        } catch (error) {
          console.error("Admin Pincode fetch error:", error);
          setFetchedAdminPincodes(getPincodesForCity(adminCity, adminState));
        } finally {
          setIsFetchingAdminPincodes(false);
        }
      };
      fetchPincodes();
    } else {
      setFetchedAdminPincodes([]);
    }
  }, [adminCity, role, adminState]);

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('jansamadhan_token', data.token); // Save Token
          // Use signup() to register staff in local directory, login() for others
          if (data.data.user.role === 'STAFF') {
            signup(
              data.data.user.name || data.data.user.email.split('@')[0], 
              data.data.user.email, 
              '', 
              data.data.user.role, 
              data.data.user.staffCategory, 
              data.data.user.staffArea,
              data.data.user.staffPincode,
              data.data.user.staffCity,
              data.data.user.staffDistrict,
              data.data.user.staffState,
              data.data.user.adminLocation
            );
          } else if (data.data.user.role === 'ADMIN') {
             signup(
               data.data.user.name,
               data.data.user.email,
               data.data.user.phone,
               'ADMIN',
               undefined,
               undefined,
               undefined,
               undefined,
               undefined,
               undefined,
               {
                 state: adminState,
                 district: adminDistrict,
                 city: adminCity,
                 pincodes: adminSelectedPincodes,
                 wards: adminSelectedWards
               }
             );
          } else {
            login(data.data.user.email, data.data.user.role);
          }
          navigate(data.data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } else {
          setError(data.message || "Google login failed.");
        }
      } catch (error) {
        setError("Failed to connect to backend.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: role,
          staffCategory: role === 'STAFF' ? staffCategory : undefined
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowOtpScreen(true);
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('jansamadhan_token', data.token); // Save Token
        // Use signup() to register staff in local staff directory
        if (role === 'STAFF') {
          signup(formData.name, formData.email, formData.phone, role, staffCategory, staffArea, staffPincode, staffCity, staffDistrict, staffState);
        } else if (role === 'ADMIN') {
          signup(formData.name, formData.email, formData.phone, role, undefined, undefined, undefined, undefined, undefined, undefined, {
            state: adminState,
            district: adminDistrict,
            city: adminCity,
            pincodes: adminSelectedPincodes,
            wards: adminSelectedWards
          });
        } else {
          login(data.data.user.email, data.data.user.role);
        }
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtpScreen) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-5 sm:p-8 bg-slate-50">
        <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
            <p className="text-slate-500 font-medium text-sm">Enter the code sent to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP Code" 
                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {loading ? <span>Verifying...</span> : (
                <>
                  <span>Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && <p className="text-rose-500 text-center text-xs font-bold">{error}</p>}
          
          <button 
            onClick={() => setShowOtpScreen(false)}
            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white lg:order-2">
        <div className="w-full max-w-sm sm:max-w-md space-y-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Join Your Community</h1>
            <p className="text-slate-500 font-medium mt-1.5 text-sm">Help us build a smarter city by joining JanSamadhan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center space-x-3 text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Alex Johnson" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 00000 00000" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
               <div className="flex items-center gap-3 flex-wrap">
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'CITIZEN' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="CITIZEN" checked={role === 'CITIZEN'} onChange={() => setRole('CITIZEN')} className="hidden" />
                  <span>Citizen</span>
                </label>
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'STAFF' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="STAFF" checked={role === 'STAFF'} onChange={() => setRole('STAFF')} className="hidden" />
                  <span>Staff</span>
                </label>
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'ADMIN' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="ADMIN" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} className="hidden" />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            {role === 'ADMIN' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 bg-slate-900/90 rounded-2xl space-y-4 shadow-2xl border-2 border-rose-500/20 backdrop-blur-md">
                  <div className="flex items-center space-x-2 px-1">
                    <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Administrative Jurisdiction</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Target State / Union Territory</label>
                      <select
                        value={adminState}
                        onChange={(e) => {
                          setAdminState(e.target.value);
                          setAdminDistrict('');
                          setAdminCity('');
                        }}
                        className="w-full h-12 px-4 bg-white/10 border border-white/20 focus:border-rose-500 rounded-xl outline-none transition-all text-sm text-white font-bold appearance-none cursor-pointer hover:bg-white/15"
                      >
                        <option value="" className="text-black bg-white">Select State</option>
                        {Object.keys(LOCATION_DATA).sort().map(s => <option key={s} value={s} className="text-black bg-white">{s}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">District</label>
                        <input
                          list="admin-districts"
                          disabled={!adminState}
                          value={adminDistrict}
                          onChange={(e) => {
                            setAdminDistrict(e.target.value);
                            setAdminCity('');
                          }}
                          placeholder={adminState ? "Type or Select District" : "Select State first..."}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 focus:border-rose-500 rounded-xl outline-none transition-all text-sm text-white font-bold hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed placeholder:text-white/20"
                        />
                        <datalist id="admin-districts">
                          {adminState && LOCATION_DATA[adminState] && Object.keys(LOCATION_DATA[adminState]).sort().map(d => (
                            <option key={d} value={d} />
                          ))}
                        </datalist>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">City / Town</label>
                        <input
                          list="admin-cities"
                          disabled={!adminDistrict}
                          value={adminCity}
                          onChange={(e) => {
                            setAdminCity(e.target.value);
                            setAdminSelectedPincodes([]);
                            setAdminSelectedWards([]);
                          }}
                          placeholder={adminDistrict ? "Type or Select City" : "Select District first..."}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 focus:border-rose-500 rounded-xl outline-none transition-all text-sm text-white font-bold hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed placeholder:text-white/20"
                        />
                        <datalist id="admin-cities">
                          {adminState && adminDistrict && LOCATION_DATA[adminState][adminDistrict] && LOCATION_DATA[adminState][adminDistrict].sort().map((c: string) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Managed Pincodes</label>
                        <button 
                          type="button"
                          disabled={!adminCity}
                          onClick={() => setShowPincodeDropdown(!showPincodeDropdown)}
                          className={`w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-left text-xs flex items-center justify-between hover:bg-white/15 transition-all ${!adminCity ? 'opacity-20 cursor-not-allowed' : 'text-white font-bold'}`}
                        >
                          <span className="truncate">{!adminCity ? 'Select a City first...' : adminSelectedPincodes.length > 0 ? adminSelectedPincodes.join(', ') : 'Select Pincodes'}</span>
                          <ArrowRight className={`w-4 h-4 transition-transform ${showPincodeDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showPincodeDropdown && adminCity && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] p-3 space-y-1.5 max-h-[250px] overflow-y-auto no-scrollbar ring-1 ring-white/10 backdrop-blur-xl">
                            <div className="p-2 border-b border-white/10 mb-2 sticky top-0 bg-slate-800 z-10">
                              <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2 px-1">Manual PIN Entry</p>
                              <div className="flex space-x-2">
                                <input 
                                  type="text" 
                                  maxLength={6}
                                  placeholder="Enter 6-digit PIN"
                                  className="flex-1 h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-[10px] text-white font-bold focus:border-rose-500 outline-none placeholder:text-white/20"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = (e.target as HTMLInputElement).value;
                                      if (val.length === 6 && !adminSelectedPincodes.includes(val)) {
                                        setAdminSelectedPincodes([...adminSelectedPincodes, val]);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                                <button 
                                  type="button"
                                  className="px-3 bg-rose-500 rounded-lg text-[9px] font-black uppercase text-white hover:bg-rose-600 transition-colors"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    const val = input.value;
                                    if (val.length === 6 && !adminSelectedPincodes.includes(val)) {
                                      setAdminSelectedPincodes([...adminSelectedPincodes, val]);
                                      input.value = '';
                                    }
                                  }}
                                >Add</button>
                              </div>
                            </div>

                            {isFetchingAdminPincodes ? (
                              <div className="p-4 flex flex-col items-center space-y-3">
                                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Official PINs...</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {adminSelectedPincodes.map(pin => (
                                  <label key={pin} className="flex items-center space-x-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl cursor-pointer transition-colors group">
                                    <input 
                                      type="checkbox" 
                                      checked={true}
                                      onChange={() => setAdminSelectedPincodes(adminSelectedPincodes.filter(p => p !== pin))}
                                      className="w-5 h-5 rounded-md border-rose-500/20 bg-rose-500/20 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                                    />
                                    <span className="text-xs font-black text-white tracking-[0.1em]">{pin} <span className="text-[8px] text-rose-400 ml-2">(Added)</span></span>
                                  </label>
                                ))}
                                {fetchedAdminPincodes.filter(p => !adminSelectedPincodes.includes(p)).map(pin => (
                                  <label key={pin} className="flex items-center space-x-3 p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                                    <input 
                                      type="checkbox" 
                                      checked={false}
                                      onChange={() => setAdminSelectedPincodes([...adminSelectedPincodes, pin])}
                                      className="w-5 h-5 rounded-md border-white/20 bg-white/5 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                                    />
                                    <span className="text-xs font-black text-white tracking-[0.1em] group-hover:text-rose-400 transition-colors">{pin}</span>
                                  </label>
                                ))}
                                {fetchedAdminPincodes.length === 0 && adminSelectedPincodes.length === 0 && (
                                  <div className="p-4 text-center text-[10px] font-bold text-rose-400 uppercase tracking-widest">No Pincodes Found</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Assigned Wards</label>
                        <button 
                          type="button"
                          disabled={!adminCity}
                          onClick={() => setShowWardDropdown(!showWardDropdown)}
                          className={`w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-left text-xs flex items-center justify-between hover:bg-white/15 transition-all ${!adminCity ? 'opacity-20 cursor-not-allowed' : 'text-white font-bold'}`}
                        >
                          <span className="truncate">{!adminCity ? 'Select a City first...' : adminSelectedWards.length > 0 ? adminSelectedWards.join(', ') : 'Select Wards'}</span>
                          <ArrowRight className={`w-4 h-4 transition-transform ${showWardDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showWardDropdown && adminCity && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] p-3 space-y-1.5 max-h-[200px] overflow-y-auto no-scrollbar ring-1 ring-white/10 backdrop-blur-xl">
                            {getWardsForCity(adminCity).map(ward => (
                              <label key={ward} className="flex items-center space-x-3 p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                                <input 
                                  type="checkbox" 
                                  checked={adminSelectedWards.includes(ward)}
                                  onChange={() => {
                                    if (adminSelectedWards.includes(ward)) {
                                      setAdminSelectedWards(adminSelectedWards.filter(w => w !== ward));
                                    } else {
                                      setAdminSelectedWards([...adminSelectedWards, ward]);
                                    }
                                  }}
                                  className="w-5 h-5 rounded-md border-white/20 bg-white/5 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                                />
                                <span className="text-xs font-black text-white tracking-[0.1em] group-hover:text-rose-400 transition-colors">{ward}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'STAFF' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-3 bg-slate-900 rounded-xl space-y-3 shadow-xl border border-slate-800">
                  <div className="flex items-center space-x-2 px-1">
                    <div className="w-1 h-3 bg-blue-500 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Jurisdiction</p>
                  </div>
                  
                  <select
                    value={staffCategory}
                    onChange={(e) => setStaffCategory(e.target.value)}
                    className="w-full h-10 px-4 bg-white/5 border border-white/10 focus:border-blue-500 rounded-lg outline-none transition-all text-sm text-white font-medium"
                  >
                    {staffCategories.map(cat => <option key={cat} value={cat} className="text-slate-900">{cat}</option>)}
                  </select>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Pincode</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          maxLength={6}
                          value={staffPincode}
                          onChange={(e) => setStaffPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6 Digit PIN" 
                          className="w-full h-10 px-4 bg-white/5 border border-white/10 focus:border-blue-500 rounded-lg outline-none transition-all text-sm text-white font-bold tracking-widest"
                          required={role === 'STAFF'}
                        />
                        {isFetchingPincode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Area / Place</label>
                      <input 
                        type="text" 
                        value={staffArea}
                        onChange={(e) => setStaffArea(e.target.value)}
                        placeholder="Work Area Name" 
                        className="w-full h-10 px-4 bg-white/5 border border-white/10 focus:border-blue-500 rounded-lg outline-none transition-all text-sm text-white font-medium"
                        required={role === 'STAFF'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">City</label>
                      <input 
                        type="text" 
                        value={staffCity}
                        onChange={(e) => setStaffCity(e.target.value)}
                        placeholder="City" 
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg outline-none text-[11px] text-slate-300 font-medium"
                        required={role === 'STAFF'}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">District</label>
                      <input 
                        type="text" 
                        value={staffDistrict}
                        onChange={(e) => setStaffDistrict(e.target.value)}
                        placeholder="District" 
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg outline-none text-[11px] text-slate-300 font-medium"
                        required={role === 'STAFF'}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">State</label>
                      <input 
                        type="text" 
                        value={staffState}
                        onChange={(e) => setStaffState(e.target.value)}
                        placeholder="State" 
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg outline-none text-[11px] text-slate-300 font-medium"
                        required={role === 'STAFF'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {loading ? <span>Connecting...</span> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">Or Join With</span></div>
            </div>

            <button 
              type="button"
              onClick={() => handleGoogleSignup()}
              className="w-full h-11 border border-slate-200 rounded-lg flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              <span className="text-xs font-bold text-slate-600">Continue with Google</span>
            </button>
          </form>
          
          <p className="text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 xl:p-16 flex-col justify-between relative overflow-hidden lg:order-1">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-14">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white tracking-tight italic">JanSamadhan</span>
          </Link>

          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Empowering Communities</span>
            </div>
            
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Build a <span className="text-blue-500">Better City</span>,<br />
              One Issue at a Time.
            </h2>
            
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              Connect directly with local authorities, track resolutions in real-time, and make your voice count in urban development.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-2xl font-black text-white tracking-tight">100%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transparency</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-white tracking-tight">24/7</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-900/20 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400 italic">
              Joined by <span className="text-white">2,400+</span> active citizens this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};