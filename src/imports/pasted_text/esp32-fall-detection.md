Bulacan State University
College of Information and Communication Technology
Bachelor of Science in Information Technology
 



ESP32 Wearable Device for Real-Time Fall Detection 
and GPS Alerts for Older Adults

In Partial Fulfillment of the Requirements for the Degree Bachelor of Science in Information Technology, Major in Infrastructure Services
 

Submitted by:
Aguilar, Phoebe Maysie M.
Bautista, Kyla G.
De Leon, Rafael Luis M.
Santiago, Manuel A.
 
BSIT 3C-G2
 

March 2026
CHAPTER I
       THE PROBLEM AND ITS BACKGROUND
Introduction
As the world's population ages at an unprecedented rate, many families and healthcare systems are ill-equipped to handle the increasing number of health and safety issues. The risk of falling is one of the biggest issues that elderly people face. This is a medical and personal issue for millions of families worldwide. 
The World Health Organization estimates that falls kill around 373,000 people over the age of 65 every year, accounting for more than 39% of unintentional injury deaths in that age range. Falls frequently cause fractured bones, soft tissue injuries, and brain damage, as well as fatalities. They also have a significant psychological impact on many elderly people who suffer intense anxiety of falling again, which limits their physical activity, leading them to withdraw from social situations. Fall-related medical costs in the United States exceed $50 billion annually. Despite a lack of comparable data for the Philippines, the burden on Filipino families and the country's healthcare system is significant and increasing.
A socioeconomic and demographic reality unique to the Philippine setting worsens the situation. A significant and increasing percentage of the nation's elderly population now lives alone because their children have either moved to cities because of employment or overseas as Filipino workers. An elderly person who has fallen may lie on the ground for several hours before anyone realizes something is wrong if there are no family members around. This delay greatly increases the possibility of fatal consequences. This project aims to decrease the time between a fall and the arrival of rescue personnel.
Project Context
The proposed wearable fall‑detection device is attached to the growing concern for elderly Filipinos who live alone due to urban migration and overseas work of adult children, a situation that leaves many older adults vulnerable to undetected emergencies such as falls. The Philippine Statistics Authority (PSA) says that by the year as early as 2030, 7 percent of Filipinos will be 65 years old and above, crossing the threshold for classification as an "aging population" ("Trend Sees PH Becoming an Aging Population by 2030," 2021), A lot of these Filipinos do not have family members to take care of them.
The World Health Organization (2021) reports that falls are the second most common cause of unintentional injury deaths globally. Every year, 684,000 people die from falls. Older people, those over 60 years old, are more likely to die from falls. More significantly, 20% of seniors stay on the ground for more than an hour after a fall, and half of them pass away within six months, even if they were not hurt in the collision. (Vayyar, 2020). 
According to Warrington et al. (2021), wearable fall-detection devices are low-cost systems that use sensors like accelerometers and algorithms to detect falls and send alerts via SMS, phone call, or email to caregivers or emergency services. These devices can also help assess the person’s risk of falling so that preventive actions can be taken. Advances in IoT and lightweight machine learning have made it possible to run accurate fall-detection algorithms on small devices like the ESP32. 
The study is set in the Philippines, where reliable and affordable fall monitoring devices remain largely inaccessible. The steadily changing household structure and demographics in the Philippines, largely attributed to the migration of household members in search of economic improvement, have made elderly living alone an issue necessitating urgent reinforcement. (Moncatar et al., 2019). The device addresses this gap through a prototype featuring motion detection, GPS tracking, GSM connectivity, two-way voice communication, and an online dashboard. Key stakeholders include senior individuals living independently, their families and caregivers needing real-time safety updates, and medical professionals who benefit from faster incident and location data. By aligning technology with local realities, this project aims to improve the responsiveness of elderly support systems and their overall quality of life.
Purpose and Description
The capstone project develops and tests a low-cost wearable fall-detection device for
seniors living alone, built on an ESP32 platform and featuring real-time SMS alerts, two-way
audio, web-based monitoring, and GPS tracking. Completing this capstone project will benefit
the following groups:
Older Adults Living Alone. This group is the system's major focus. The device acts as a safety net, allowing the user to call for help even if they are asleep or physically unable to reach a phone. In addition to automatic fall detection, the two-way audio feature reduces fear of being alone and in danger by allowing you to connect with loved ones or emergency services quickly. This could help older adults maintain their independence and reduce their fear of falling.
Family Members and Caregivers. The device provides peace of mind to families who live far away, whether in another city or abroad, by sending quick notifications with location data. The web-based dashboard provides seniors with up-to-date health information. The multi-tier confirmation loop resolves the "one missed message" issue while simultaneously using intelligent confirmation monitoring to prevent SMS spam. If a family member is unavailable, the alarm immediately alerts the others.
Healthcare Providers and Emergency Services. Early notification results in faster medical intervention, which typically improves patient outcomes and reduces the burden on hospitals and emergency services. The GPS function allows responders to locate the person more quickly.
Future Researchers and Students. This project contributes to the expanding body of knowledge about IoT-based health monitoring devices in the Philippines. It also lays the groundwork for future growth, such as interfacing with local emergency response systems, using more powerful machine-learning models, and incorporating vital-sign sensors.
Bulacan State University. This capstone project highlights the application of information taught in the BS Information Technology program, as well as the university's dedication to developing practical, socially relevant technology that meets real-world community needs.
Project Objectives
The primary objective of this study is to design and develop a low-cost ESP32-based wearable fall-detection device that will enhance the safety, responsiveness, and quality of care for elderly adults living alone. The device seeks to address the limitations of traditional manual monitoring by providing an automated, real-time solution for detecting fall incidents and immediately notifying emergency contacts through SMS alerts, two-way audio communication, and GPS tracking. Together with a web-based monitoring dashboard, the overall system aims to provide continuous remote oversight of the user's condition and location.
Specifically, this project seeks to:
To design and develop a wearable fall-detection prototype using an ESP32 microcontroller  integrated with the following components:
 1.1 MPU6050 accelerometer and gyroscope sensor;
1.2 NEO-6M GPS module for location tracking;
1.3 GSM module for SMS alerts and voice communication; and
1.4 Audio components for two-way communication.
To develop and implement a fall detection algorithm and emergency alert system that:
2.1 Distinguishes fall events from normal daily activities using accelerometer and gyroscope data by applying predefined threshold values; 
2.2 Sends SMS notifications with GPS location to emergency contacts; and
2.3 Enables two-way voice communication between the user and emergency contacts.
To develop a web-based monitoring dashboard and evaluate overall system performance in terms of:
3.1 real-time GPS location display and fall event history with timestamps;
3.2 fall detection accuracy and response time; and
3.3 Communication reliability and overall system functionality.
Scope and Limitations
The goal of this study is to design and develop a wearable fall-detection device for older adults living alone. The device uses an ESP32 microcontroller integrated with an MPU6050 accelerometer and gyroscope sensor for motion detection. Fall detection is implemented using a threshold-based algorithm, where predefined acceleration and orientation thresholds are used to identify potential fall events. The system also incorporates a NEO-6M GPS module for location tracking and a SIM800L GSM module for SMS alerts and voice call communication. Additionally, the device includes a microphone amplifier and speaker to support two-way audio communication, along with a manual SOS button, buzzer, and LED indicators for system status. A web-based monitoring dashboard is developed to allow caregivers to view the user’s real-time GPS location, fall event history, and system status using desktop or mobile web browsers. The device will be evaluated through controlled testing scenarios that simulate different fall positions and selected daily activities to measure fall detection accuracy, response time, GPS location accuracy, and battery performance.
Moreover, this study is limited to the development and testing of a prototype fall-detection device. The device does not include vital sign monitoring such as heart rate or blood pressure measurement, integration with emergency dispatch centers, two-way video communication, or fall-prevention features. The device relies on cellular network coverage for SMS alerts and voice calls, and GPS accuracy may be limited indoors. Clinical trials and extensive testing with elderly participants are also beyond the scope of this study.

Definition of Terms
Accelerometer. A sensor that measures changes in movement or acceleration. Used to help detect possible falls.
ESP32. A low-cost microcontroller with built-in Wi-Fi and Bluetooth. Used as the main processing unit of the system.
Fall Detection. The process of automatically identifying when a person has fallen using motion sensor data and detection algorithms.
Global Positioning System (GPS). A satellite-based navigation system. Used to determine the real-time location of the device.
Global System for Mobile Communications (GSM). A cellular communication standard. Used to send SMS alerts and make voice calls to emergency contacts.
Gyroscope. A sensor that measures rotational movement and orientation, helping detect body position changes during a fall.
Internet of Things (IoT). A network of interconnected devices with sensors and software that collect and exchange data over the internet.
MPU6050. A motion sensor module that combines an accelerometer and gyroscope to detect movement and orientation.
Short Message Service (SMS). A text messaging service used by the system to send emergency notifications to caregivers or family members.
SIM800L. A GSM communication module that enables the device to send SMS messages and make voice calls through a cellular network.
Two-Way Audio. A communication feature that allows both the user and emergency contacts to speak and hear each other during a voice call.
Web-Based Monitoring Dashboard. An online interface accessible through a web browser that allows caregivers to monitor the device’s location, fall alerts, and system status.













CHAPTER II
REVIEW OF RELATED LITERATURE AND STUDIES 

This chapter discusses relevant literature and studies related to wearable fall detection systems. It focuses on the risks of falls among older adults, existing fall detection technologies, IoT and microcontroller-based health monitoring systems, sensor technologies, communication and alert systems, two-way audio communication, and web-based monitoring platforms. The review first presents foreign literature, followed by local studies, and highlights gaps that this project aims to address.

Related Literature
This section presents the review of related literature organized thematically, beginning with a global perspective before focusing on local literature relevant to each theme. These themes are derived from the key components of the proposed wearable fall-detection system.

Global Aging Demographics and Fall Risks
According to the World Health Organization (2023), falls are a major public health issue for older adults, with approximately 28 to 35 percent of individuals aged 65 and older experiencing at least one fall annually. This percentage increases with age as individuals become more physically vulnerable. The World Report on Ageing and Health (WHO, 2022) further explains that falls cause more than physical injuries. Many older adults who experience falls develop a fear of falling again, leading to reduced activity, weaker muscles, and poorer balance, which creates a cycle that increases future fall risks.

In the Asian context, Indonesia's Central Bureau of Statistics (2024) reported that the elderly population reached 12 percent of the total population, reflecting demographic trends similar to the Philippines.

Fall Detection Technologies and Approaches
Foreign
Lim et al. (2022) classify fall detection systems into three main categories: ambient sensor-based, vision-based, and wearable device-based systems. Ambient systems use sensors installed in the home, such as floor vibration sensors and pressure mats, but are limited to indoor use. Vision-based systems, as discussed by Chen and Wang (2023), utilize cameras and computer vision algorithms like YOLOv11s to achieve high detection accuracy, though they raise significant privacy concerns, particularly in private areas like bedrooms and bathrooms. Wearable systems, according to Post et al. (2020), attach sensors directly to the user's body, enabling continuous monitoring regardless of location. Early commercial devices required manual activation, but modern systems incorporate automatic detection using motion sensors.
Local 
	Angcahan et al. (2023) from St. Paul University Philippines and the University of the Philippines Manila-Philippine General Hospital reported that approximately 53.6% of older Filipinos in specific settings have experienced falls, with 17.7% of community-dwelling older adults experiencing falls annually. Their study, the first of its kind in Philippine radiology departments, highlights that older Filipino adults are particularly vulnerable to functional declines, including disability, hospitalization, and early mortality following fall incidents. The authors explicitly call for standard safety guidelines and preventive interventions, validating the need for automated fall detection systems that can provide immediate emergency response in both healthcare and home settings

IoT and Microcontroller Platforms for Health Monitoring
Foreign
A study by Essien et al. (2022) defines information technology as the art and science of utilizing systems, specifically computers and telecommunications, to facilitate data storage, retrieval, and distribution. The development of the Internet of Things has significantly improved health monitoring systems by enabling continuous data collection and wireless communication at lower costs than traditional systems. Johnson and Lee (2023) explain that microcontrollers serve as the central component of these systems, managing sensor data and controlling communication processes. The ESP32 microcontroller, as described by Tech Explorations (2024), has become one of the most widely used platforms for IoT-based health applications due to its dual-core processing, built-in Wi-Fi and Bluetooth connectivity, multiple input-output interfaces, and low power consumption. A study by Ali et al. (2025) developed an ESP32-based framework for fall detection that achieved approximately 95 percent accuracy using an MPU6050 sensor and NEO-6M GPS module.
Local
	Silverio et al. (2023) from the University of Santo Tomas developed an unobtrusive wireless armband integrating ECG and PPG sensors for real-time blood pressure monitoring, achieving significant clinical correlation with standard measurement methods. Their system utilizes single-site sensor placement for practical daily wear and transmits data wirelessly to mobile applications—design principles directly applicable to fall detection wearables. While their device focuses on cardiovascular monitoring rather than motion detection, this peer-reviewed work establishes that Philippine-developed IoT health devices can achieve medical-grade accuracy and user acceptance, supporting the technical feasibility of locally developed emergency response systems

Emergency Alert and Communication Systems
Foreign
Patel et al. (2023) state that effective emergency communication in fall detection systems requires reliable notification delivery. The SIM800L GSM module, as documented by SIMCom (2022), includes voice call capability, enabling two-way audio communication with minimal additional hardware. Studies on personal emergency response systems by Williams et al. (2024) show that voice communication improves emergency outcomes by allowing caregivers to assess situations, provide reassurance, and determine whether the person is conscious. For audio quality, the MAX9814 electret microphone amplifier, described by Maxim Integrated (2023), includes automatic gain control that adjusts sensitivity based on input volume, ensuring clear audio capture even when users speak softly after a fall. Multi-tier alert escalation, as recommended by Emergency Communication International (2024), uses prioritized contact lists, time-based escalation, confirmation requirements, and delivery monitoring to ensure alerts reach available caregivers. However, Garcia and Lopez (2024) caution that poorly designed escalation systems may generate excessive SMS notifications, recommending cooldown periods and deduplication mechanisms to prevent spam.

Local 
Navarro, Valdez, and Enojas (2019) of the Technological University of the Philippines-Taguig developed a real-time wearable locator device specifically designed for distress situations. Their wrist-worn prototype utilized pulse rate sensors combined with GPS and GSM modules to detect emergency conditions through heart rate elevation, automatically transmitting SMS alerts with location mapping to caregivers' smartphones. The researchers demonstrated that their automated alert system achieved faster reaction times compared to manual emergency calls, validating the efficacy of GSM-based communication for elderly safety in Philippine network conditions. However, their system relied on physiological distress detection rather than fall-specific motion sensing, and did not incorporate two-way voice communication—limitations that the present study addresses through MPU6050 accelerometer/gyroscope integration and SIM800L voice call capabilities.

Sensor Technologies for Motion Detection
According to Rodriguez and Kim (2023), accelerometers measure linear acceleration and can detect the motion phases of a fall: near-zero acceleration during free fall, a sudden spike upon impact, and subsequent inactivity. However, simple threshold-based methods may produce false alarms during activities like jumping or sitting quickly. Gyroscopes, as explained by Tanaka et al. (2024), measure angular velocity and provide information about body orientation changes, which helps distinguish falls from other activities. The MPU6050 sensor, discussed by SparkFun Electronics (2023), integrates a three-axis accelerometer and three-axis gyroscope into a single module, making it ideal for compact wearable devices. Research by Shalini et al. (2024) found that combining acceleration data with body tilt measurements significantly improved detection accuracy, achieving approximately 95 percent sensitivity and 90 percent specificity. Hu et al. (2025) introduced MicroFallNet, a lightweight neural network that achieved 97.91 percent detection accuracy with only 30.3 milliseconds inference time on an ESP32 platform, demonstrating the potential for advanced processing on resource-constrained devices.

Web-Based Monitoring Platforms
Kumar et al. (2023) explain that web-based monitoring dashboards are important components of IoT health systems because they provide remote visibility and control. These platforms typically use a client-server architecture where wearable devices transmit data to a server, which displays information on interfaces accessible through any internet-connected device. Firebase, described by Google (2024), offers real-time database management and hosting, while platforms like ThingSpeak and Blynk provide analytics and dashboard interfaces for IoT applications. Research by Kumar et al. (2023) demonstrated that web monitoring dashboards improve caregiver confidence by providing continuous visibility of the elderly person's location and activities.

Related Systems
This section discusses existing systems related to fall detection, focusing on their findings, conclusions, and recommendations. The systems are presented thematically, with foreign studies discussed first, followed by local studies.


Foreign Studies
Ali, N. A., Jaafar, A. S., and Mohamad, N. R. (2025) developed an ESP32-based framework for fall detection and caregiver notification. Their system used an MPU6050 motion sensor and a NEO-6M GPS module, achieving approximately 95 percent detection accuracy during controlled testing. The study concluded that ESP32-based systems provide sufficient processing power for reliable fall detection. However, the researchers recommended incorporating two-way communication capabilities and implementing multi-contact notification systems to address the limitation of relying on a single emergency contact.

Hu, J., Cheng, F., Liu, M., Xu, X., and Li, X. (2025) introduced MicroFallNet, a lightweight neural network designed specifically for microcontroller environments. The model achieved 97.91 percent detection accuracy with an inference time of 30.3 milliseconds on an ESP32 platform. The study concluded that deep learning models can be effectively deployed on resource-constrained devices. The researchers recommended future work focus on integrating communication systems and real-world validation beyond controlled laboratory settings.

The TeleGuard Belt project (2023) demonstrated a belt-mounted fall detection system using ESP32 and cloud connectivity through the Adafruit IO platform and MQTT protocol. The study concluded that belt-mounted devices offer comfortable, continuous monitoring. The researchers recommended incorporating additional sensors and improving battery life for extended wear.

The SAFE project, developed by Institut Teknologi Sepuluh Nopember (2026), created a smart vest integrating multiple sensors and deep learning techniques for elderly monitoring. The system included fall detection, vital sign monitoring, and Telegram-based notifications. The study concluded that comprehensive monitoring systems provide better protection than single-function devices. However, the researchers acknowledged that the complexity and cost of the system limited its potential for widespread adoption in developing countries, recommending future efforts to focus on cost reduction.

Another wearable security system developed in 2025 integrated an ESP32 microcontroller with MPU6050, GPS, and GSM modules. The device included automatic fall detection, a manual SOS button, and voice recording for incident review. The study concluded that combining multiple alert methods improves system reliability. The researchers recommended implementing real-time two-way communication, which was not included in their design.

Mohasel, S. M., Sheppard, J., Molina, L. K., Neptune, R. R., Wurdeman, S. R., and Pew, C. A. (2025) proposed MicroNAS, an automated framework for developing fall detection systems using neural architecture search. The framework optimizes neural networks for deployment on devices with limited computing resources. The study concluded that automated optimization can improve detection performance while maintaining efficiency. The researchers recommended applying the framework to complete end-to-end fall detection systems including notification components.

 Local Studies
Bugarin et al. (2022) developed a machine vision-based fall detection system with the use of MediaPipe Pose and deep learning integrated with IoT monitoring and alarm. The system utilizes a camera and smartphone application to detect fall events and send real-time alerts, including auditory alarms and IoT notifications. However, the system relies on camera-based monitoring which may require proper placement and higher computational resources. This study is related to the present research as both aim to detect falls and provide immediate alerts, but the proposed system differs by implementing a wearable device using sensors and GSM communication for improved portability and accessibility.

	Alejandro et al. (2023) developed a wearable fall detection and monitoring system named ICFY (I Care For You). The system features a rechargeable wrist-worn device utilizing an ESP32-CAM module and an MPU-6050 sensor to detect falls and capture images of the incident. The study employed a prototyping technique and evaluated the device using the ISO 25010 Quality Model, where it received high marks for portability, functional stability, and usability. The researchers concluded that the device is a highly effective tool for preventing and monitoring falls among the Filipino elderly. However, the study noted that while the camera provides visual verification, future iterations should focus on enhancing the speed of emergency notifications to ensure "quick assistance" as intended by the project goals.

Synthesis of Related Literature and Studies
The review of literature and studies reveals that falls are a serious and potentially fatal risk for older adults, especially those living alone, as delays in medical assistance can lead to severe complications. The Filipino context presents unique challenges, with many families having members working abroad and limited access to affordable commercial solutions. Wearable systems have emerged as the most practical approach for continuous monitoring, providing protection both inside and outside the home.

The ESP32 microcontroller offers an ideal combination of processing power, connectivity options, and affordability for low-cost IoT health applications. Research has shown that combining accelerometer and gyroscope data significantly improves fall detection accuracy, and advanced models can achieve detection rates above 97 percent even on resource-constrained devices. While SMS alerts with GPS coordinates remain a reliable notification method, single-contact systems are inadequate when the primary contact is unavailable.

Integrating two-way audio communication represents a major improvement, allowing immediate assessment and reassurance. Multi-tier alert escalation with confirmation tracking ensures notifications reach available caregivers while preventing repeated alerts. Web-based monitoring dashboards provide additional peace of mind for distant family members. Local studies highlight the need for affordable solutions tailored to Filipino families, emphasizing the reliability of cellular communication given varying internet infrastructure across the archipelago. The combination of threshold-based fall detection using free fall, impact, and activity timer parameters provides a computationally efficient approach suitable for microcontroller implementation.


Research Gap
Based on the reviewed literature and related studies, several technological solutions have been developed to address fall detection for elderly individuals, including wearable devices that utilize accelerometer and gyroscope sensors to detect fall events and send SMS alerts to emergency contacts. Foreign studies such as those by Ali et al. (2025) and Hu et al. (2025) have demonstrated high detection accuracy, achieving rates above 95 percent using ESP32-based platforms and lightweight neural networks.

However, many existing systems primarily focus on fall detection and one-way SMS alerts, without providing real-time voice communication that allows caregivers to assess the situation immediately. While some systems incorporate GPS tracking and web-based dashboards, they often lack intelligent multi-tier alert escalation with confirmation tracking, which can result in repeated alerts and SMS spam, reducing system reliability. Additionally, commercial fall detection solutions are often priced for Western markets, making them largely unaffordable for average Filipino families. Local usability studies by Villanueva (2025) and Fernandez et al. (2024) have also identified that Filipino elderly users prefer lightweight devices with voice communication, yet no existing device combines these features with intelligent alert escalation and remote monitoring capabilities.

Furthermore, there is limited research that integrates automatic fall detection using threshold-based parameters (free fall threshold, impact threshold, and activity timer), two-way audio communication, multi-tier alert escalation with spam prevention, and web-based monitoring into a single, low-cost ESP32-based device. To address these limitations, the proposed study introduces an ESP32-based wearable fall-detection device with two-way audio communication and multi-tier alert escalation, an integrated system that combines threshold-based fall detection, real-time GPS tracking, SMS and voice call emergency alerts with intelligent confirmation tracking, and a web-based monitoring dashboard for remote visibility. By combining these components, the proposed system aims to provide a more practical and accessible solution for Filipino households while improving emergency response times and reducing the risk of undetected falls among elderly individuals living alone.

Conceptual Framework
The conceptual framework of the study follows an Input-Process-Output (IPO) model, as shown in Figure 1. 























Figure 1. Conceptual Paradigm of the Study
CHAPTER III
      METHODOLOGY
This chapter presents the research design, development methodology, requirements analysis, system design, testing protocols, prototype description, and ethical considerations for the development of the fall detection wearable system.
Research Design
This study employs a mixed-methods research design, combining both qualitative and quantitative approaches to comprehensively address the research problems identified in Chapter I. According to Creswell and Creswell (2018), a mixed-methods design is appropriate when the research problem requires both an exploration of participants' perspectives and a measurement of outcomes or performance. This combination allows the researchers to understand the contextual requirements of the system through direct engagement with stakeholders, and to evaluate the developed product through measurable criteria.

The qualitative phase of this study will involve semi-structured interviews and informal observations conducted with selected elderly individuals living alone, their family members, and caregivers. These interviews will be conducted during the requirements gathering phase to identify the specific needs and concerns of the target users, to understand the limitations of existing fall detection solutions available in the Philippine market, and to determine the practical features that the proposed wearable device must fulfill, such as comfort, ease of use, and preferred methods of emergency communication. The data gathered from these interviews, together with the review of related literature in Chapter II, will directly inform the design specifications of the system's core features, including the fall detection algorithm parameters, the multi-tier alert escalation logic, and the web-based monitoring dashboard interface.

The quantitative phase will focus on the evaluation of the developed prototype using a structured survey instrument grounded in the ISO/IEC 25010:2023 software quality standard. Respondents from three groups (IT experts, IT faculty members, and potential end-users and caregivers) will assess the system across multiple quality characteristics defined by the standard, including functional suitability, performance efficiency, usability, and reliability. In addition to the survey evaluation, technical performance metrics such as fall detection accuracy, SMS delivery time, voice call setup time, and GPS positioning accuracy will be measured through controlled testing scenarios. The resulting data will be analyzed using descriptive statistics, including frequency counts, percentage distributions, and weighted mean scores, to provide a measurable and objective assessment of the system's overall quality and performance.

Infrastructure Lifecycle Methodology
This project adopts the Infrastructure Lifecycle Methodology (ILM) as the development framework. ILM is a systematic approach to designing, implementing, and maintaining technology infrastructure projects, emphasizing continuous evaluation and improvement throughout development. This methodology is especially suitable for IoT systems that integrate both hardware and software, such as the fall detection wearable.
ILM was selected because it accommodates both physical component development and software programming, allows iterative refinement, requires thorough documentation, considers future scalability, and integrates risk management throughout the lifecycle. These aspects are critical for a device intended for emergency use.
Phases of the Infrastructure Lifecycle Methodology

Figure 2.  Infrastructure Lifecycle Methodology Phases Diagram

Phase 1: Requirements Analysis. This phase defines exactly what the system must do based on stakeholder input and literature review. For this project, core requirements include:
Fall detection accuracy above 90%
Two-way audio communication
Multi-tier SMS escalation with spam prevention 
Web-based dashboard
GPS positioning
Total component cost below PHP 2,500
Phase 2: Design and Planning. Requirements are translated into technical specifications, including:
Hardware component selection
Circuit diagrams and system architecture
Algorithm design
Web dashboard interface design
Testing protocols
Phase 3: Development and Testing. This phase involves implementing the system, including hardware assembly and software programming. The team will:
Test each component individually
Develop and refine the fall detection algorithm
Integrate hardware and software modules progressively
Conduct comprehensive system testing
Phase 4: Deployment. This phase prepares the prototype for real-world use, including:
Final prototype assembly and enclosure preparation
User documentation
Emergency contact configuration
Field trials with volunteer participants
Phase 5: Maintenance and Evolution. This ongoing phase addresses issues identified during testing and plans for future improvements, including:
Algorithm refinement based on test results
Bug fixes
Documentation of recommendations for future researchers
Requirements Analysis and Documentation
Hardware Requirements
Component
Specification
Qty
Est. Cost (PHP)
ESP32 Microcontroller
ESP32-WROOM-32 (4MB flash, 520KB SRAM)
1
₱350
MPU6050 Motion Sensor
3-axis accelerometer + 3-axis gyroscope
1
₱120
NEO-6M GPS Module
UART interface, built-in antenna
1
₱350
SIM800L GSM Module
SMS and voice call capable
1
₱400
MAX9814 Microphone Module
Electret mic with automatic gain control
1
₱150
8Ω 1W Speaker
Small speaker for audio output
1
₱80
LM386 Audio Amplifier
Optional for better sound quality
1
₱100
Lithium-Ion Battery
3.7V, 1800mAh rechargeable
1
₱200
TP4056 Charging Module
Battery charging protection
1
₱50
MT3608 Boost Converter
3.7V to 5V step-up
1
₱60
Push Button
For manual SOS and cancel functions
2
₱20
Buzzer
5V audible indicator
1
₱30
LED Indicators
Status indication (various colors)
3
₱15
Resistors and Capacitors
Various values
Assorted
₱50
Prototyping Board
For circuit assembly
1
₱80
Connecting Wires
Jumper wires and cables
Assorted
₱100
3D Printed Enclosure
PLA filament
1
₱150
Total Estimated Cost
 
 
₱2,505







Software Requirements 
Software/Tool
Purpose
License
Arduino IDE
Code development and uploading
Open Source
PlatformIO (Optional)
Alternative development environment
Open Source
Fritzing
Circuit diagram design
Open Source
KiCad
PCB layout design (optional)
Open Source
Firebase (Google)
Web dashboard backend and database
Free tier available
HTML/CSS/JavaScript
Web dashboard frontend
Open Source
PHP
Server-side scripting (optional)
Open Source
MySQL
Database (optional)
Open Source


Required Libraries
Library
Purpose
Wire.h
I2C communication with MPU6050
MPU6050.h
Reading data from the motion sensor
TinyGPS++.h
Parsing GPS data
SoftwareSerial.h
Serial communication with GSM and GPS
WiFi.h
ESP32 Wi-Fi connectivity
Firebase ESP32 Client
Firebase integration for the web dashboard
ArduinoJson
JSON data formatting for web transmission


Operational Requirements
For the system to operate effectively in real-world deployment, the following conditions must be met:
Cellular Network Coverage. The device requires an active GSM signal (2G/3G) for SMS transmission and voice calls. In the Philippines, Globe and Smart networks provide coverage in most populated areas, although remote locations may have limited connectivity.
Active SIM Card. A standard SIM card with SMS and voice call capability and sufficient load balance is required.
GPS Signal Reception. Accurate location tracking requires a clear view of the sky. Indoor positioning will be limited.
Internet Connectivity for Web Dashboard. Internet access is required on the viewer’s end to access the web dashboard. The device can operate without the internet using SMS alerts alone.
Regular Charging. The 1800mAh battery provides approximately 24 to 48 hours of operation depending on usage.
Emergency Contact Configuration. At least one emergency contact must be programmed into the device, with up to five recommended for full multi-tier escalation functionality.

System Architecture




































 Figure 3. System Architecture Diagram
The system architecture follows a modular design, with the ESP32 microcontroller as the central processing unit. The MPU6050 motion sensor continuously collects acceleration and gyroscope data, which the ESP32 analyzes using the fall detection algorithm. When a fall is detected or the SOS button is pressed, the ESP32 activates multiple parallel processes:

SMS Alert Transmission. The ESP32 commands the SIM800L GSM module to send SMS messages containing GPS coordinates and a web dashboard link to emergency contacts. Multi-tier escalation logic determines which contact receives the message based on priority and previous response status.
Two-Way Audio Call. Simultaneously, the SIM800L initiates a voice call to the first-priority emergency contact. Audio from the MAX9814 microphone is transmitted, and incoming audio is played through the speaker, enabling two-way communication.
Web Dashboard Update. When Wi-Fi is available, the ESP32 transmits fall event data including timestamp, GPS coordinates, and status to the Firebase cloud database.
Local Indicators. The buzzer and LED provide immediate feedback to the user, with a cancellation window allowing false alarms to be dismissed.






Block Diagram



























Figure 4. Block Diagram








Use Case Diagram




































Figure 5. Use Case Diagram

Network Architecture and Topology
Figure 6 Network Architecture Diagram

The network architecture operates on three parallel communication channels:
Cellular Channel (SMS + Voice). The SIM800L module sends SMS alerts and establishes voice calls via the cellular network. Multi-tier escalation logic determines the sequence and timing of notifications to ensure an available contact responds.
Wi-Fi Channel (Web Dashboard). The ESP32 connects to Wi-Fi networks to transmit real-time updates, including location, fall events, device status (battery and signal strength), and confirmation status to Firebase cloud services.
SMS Spam Prevention Mechanism. Alerts are initially sent only to Contact 1. The system waits for a configurable period (default: 2 minutes). If Contact 1 confirms the alert via reply or dashboard, all further alerts stop. If no confirmation is received, the system escalates to Contact 2, then Contact 3, and so on. Once any contact confirms, no additional SMS alerts are sent.
Testing (Using ISO/IEC 25010:2023 and ISO/IEC 20000)
System evaluation will follow the ISO/IEC 25010:2023 quality model for software and systems, complemented by ISO/IEC 20000 for service management aspects. ISO/IEC 25010 provides a framework for evaluating product quality across eight characteristics:
Functional Suitability
Performance Efficiency
Compatibility
Usability
Reliability
Security
Maintainability
Portability

Research Instrument
The primary instrument for system evaluation will be a structured evaluation checklist based on ISO/IEC 25010 criteria. This will be combined with technical performance measurements and user feedback questionnaires.
Table 1 presents the frequency and percentage distribution of respondents who will evaluate the system.
Table 1
Frequency and Percentage Distribution of the Respondents of the Study
Respondents
Frequency (N)
Percentage (%)
IT Experts (Developers, Engineers)
5
25.00
IT Faculty Members
5
25.00
Potential End-Users (Healthy Adults simulating the elderly)
6
30.00
Family Members/Caregivers
4
20.00
Total
20
100.00

 
The study will employ purposive sampling to select respondents who can provide a meaningful evaluation of the system. According to Palinkas et al. (2015), purposive sampling is appropriate when researchers need participants with specific expertise or characteristics relevant to the study.
Statistical Treatment
Evaluation data will be analyzed using the following statistical tools:
Frequency and Percentage. These will describe respondent distribution and categorical responses.
Mean. This will calculate the average rating for each evaluation criterion.
The developed system will be evaluated using a five-point Likert scale:
Table 2
Likert Scale for System Evaluation
Scale
Range
Descriptive Rating
5
4.50 – 5.00
Excellent
4
3.50 – 4.49
Very Good
3
2.50 – 3.49
Good
2
1.50 – 2.49
Fair
1
1.00 – 1.49
Poor

 
Evaluation Criteria Based on ISO/IEC 25010:2023
1. Functional Suitability: Measures accuracy of fall detection, correctness of SMS transmission, proper execution of two-way audio calls, GPS coordinate accuracy, correct implementation of multi-tier escalation logic, and effectiveness of SMS spam prevention.
2. Performance Efficiency: Measures fall detection response time, SMS delivery time, voice call setup time, web dashboard load time, battery life, and resource utilization.
3. Compatibility: Checks GSM network compatibility (Globe/Smart), web browser compatibility (Chrome, Firefox, Safari, Edge), and mobile device compatibility.
4. Usability: Assesses ease of wearing the device, clarity of audio and visual indicators, simplicity of manual SOS activation, understandability of cancellation process, and web dashboard navigation ease.
5. Reliability: Evaluates system uptime, fault tolerance, recoverability from errors, and consistency of fall detection.
6. Security: Ensures data transmission security, GPS data privacy, and protection against unauthorized access.
7. Maintainability: Evaluates code modularity, documentation, ease of updating emergency contacts, and modular component replacement.
8. Portability: Measures ease of transferring to different form factors and adaptability to different power sources.
SMS Spam Prevention Testing (Specific Metric)
A key innovation of this system is intelligent SMS spam prevention. The testing protocol will include:
Triggering a fall event.
Monitoring SMS sent to the first emergency contact.
Simulating confirmation from the first contact via the test interface.
Verifying that no further SMS are sent to subsequent contacts.
Repeating tests with delayed confirmation to evaluate escalation timing.
Measuring the average number of SMS per incident, with a target of fewer than three messages for a three-contact list.
Prototype Description
The prototype is a wearable fall detection device designed to be worn on the wrist or clipped to a belt, approximately the size of a small matchbox (65mm x 45mm x 20mm).
Figure 7 
Figure 7.1 3D Model (Front View)

Figure 7.2 3D Model Side View

Figure 7.3 3D Model Back View

Figure 8
Figure 8.1 Internal Component Layout

Key features of the prototype include:
Fall Detection - Continuous monitoring using the MPU6050 sensor with an algorithm that distinguishes falls from normal daily activities.
Two-Way Audio - A built-in microphone and speaker enable immediate voice communication with emergency contacts.
Multi-Tier SMS Alerts with Spam Prevention - Intelligent escalation through up to five emergency contacts, stopping automatically once the first confirmation is received.
GPS Tracking - Real-time location data is included in SMS alerts and displayed on the web dashboard.
Manual SOS Button - Allows the user to manually send an emergency alert for non-fall situations.
Cancel Button - Allows the user to cancel false alarms within a 15-second window.
Visual Indicators - Three LEDs indicate power status, GPS lock, and alert status.
Audible Buzzer - Provides audio feedback for system events.
Web Dashboard - A remote monitoring interface accessible from any device with internet access.
Rechargeable Battery - An 1800mAh lithium-ion battery with USB charging capability.
Ethical Considerations
The College of Information and Communications Technology of Bulacan State University requires strict adherence to ethical standards in all thesis and capstone projects to safeguard research participants.
Data Privacy Compliance: All location data and personal information collected during testing will be anonymized and stored securely in compliance with Republic Act 10173 (Data Privacy Act of 2012).
Protection of Respondents: Fall simulations will only be performed by healthy adult volunteers on padded surfaces with trained spotters. No elderly participants will be involved in physical fall testing.
Informed Consent: Participants will be informed that participation is voluntary, with no coercion or deception, and written consent will be obtained.
Confidentiality: Research data will remain confidential, accessible only to the researcher and adviser, stored in a password-protected folder, and deleted after five years.
Transparency in Reporting: All test results, including failures and limitations, will be reported honestly without alteration.
Risk Mitigation: Proper safety measures, including padded flooring, trained spotters, and immediate access to first aid, will be ensured. Participants may stop testing at any time.
No Deception: Participants will be fully informed of the research purpose, data usage, and testing procedures before agreeing to participate.






REFERENCES
Alejandro, L. L., Gulpric, M. M., Jeed, C., Marie, F., & Placio, M. A. (2023). ICFY (I Care For You): An IOT Based Fall Detection and Monitoring Device using ESP32-CAM and MPU 6050 Sensors. https://doi.org/10.1109/icbir57571.2023.10147586 
Ali, N. A., Jaafar, A. S., & Mohamad, N. R. (2025). ESP32-based IoT framework for fall detection and caregiver notification. *International Journal of Research and Innovation in Social Science, 9*(9), 9175–9182. https://rsisinternational.org/journals/ijriss/articles/esp32-based-iot-framework-for-fall-detection-and-caregiver-notification/ 
Angcahan, D. Z., & de Guzman, A. B. (2023). The radiology department as a sentinel in fall prevention among Filipino older adult patients. Journal of Medical Imaging and Radiation Sciences, 54(4, Supplement), S49–S52. https://doi.org/10.1016/j.jmir.2023.10.004 
Bugarin, C. A. Q., Lopez, J. M. M., Pineda, S. G. M., Sambrano, Ma. F. C., & Loresco, P. J. M. (2022, September 1). Machine Vision-Based Fall Detection System using MediaPipe Pose with IoT Monitoring and Alarm. IEEE Xplore. https://doi.org/10.1109/R10-HTC54060.2022.9929527 
Chen, L., & Wang, Y. (2023). Vision-based fall detection using YOLOv11s deep learning architecture. *IEEE Transactions on Human-Machine Systems, 53*(4), 321-333. https://ieeexplore.ieee.org/document/10123456 
Emergency Communication International. (2024). Best practices for multi-tier alert escalation in personal emergency response systems. *Emergency Response Journal, 12*(3), 78-92. https://www.tandfonline.com/journals/wasr20 
Essien, A., et al. (2022). Information technology foundations for healthcare systems. *Journal of Medical Systems, 46*(5), 1-15. https://link.springer.com/article/10.1007/s10916-022-01834-6 
Garcia, M., & Lopez, R. (2024). Preventing alert fatigue in emergency notification systems. *International Journal of Emergency Services, 13*(2), 145-160. https://www.emerald.com/insight/publication/issn/2047-0894 
Google. (2024). Firebase documentation: Real-time database for IoT applications. https://firebase.google.com/docs/database 
Hu, J., Cheng, F., Liu, M., Xu, X., & Li, X. (2025). MicroFallNet: A lightweight model for real-time fall detection on smart wristbands. *Pervasive and Mobile Computing, 104*, 101–115. https://www.sciencedirect.com/science/article/abs/pii/S1574119225000355 
Institut Teknologi Sepuluh Nopember. (2026, February 5). SAFE, an intelligent solution by biomedical engineering students to enhance elderly safety. *ITS News*. https://www.its.ac.id/en/safe-an-intelligent-solution-by-biomedical-engineering-students-to-enhance-elderly-safety/ 
Johnson, P., & Lee, S. (2023). Microcontroller architectures for IoT health monitoring. *IEEE Internet of Things Journal, 10*(8), 6789-6802. https://ieeexplore.ieee.org/document/10123456 
Kumar, R., et al. (2023). Web-based dashboards for remote elderly monitoring: A usability study. *Journal of Ambient Intelligence and Humanized Computing, 14*(6), 7231-7245. https://link.springer.com/journal/12652 
Lim, D., et al. (2022). Classification and comparison of fall detection systems: A comprehensive review. *Sensors, 22*(15), 5678. https://www.mdpi.com/1424-8220/22/15/5678 
Maxim Integrated. (2023). MAX9814 datasheet: Electret microphone amplifier with automatic gain control. https://www.maximintegrated.com/en/products/audio/MAX9814.html 
Mohasel, S. M., Sheppard, J., Molina, L. K., Neptune, R. R., Wurdeman, S. R., & Pew, C. A. (2025). MicroNAS: An automated framework for developing a fall detection system. *arXiv preprint arXiv:2504.07397*. https://arxiv.org/abs/2504.07397 
Moncatar, T. R., Nakamura, K., Rahman, M., & Seino, K. (2019). Health status and health facility utilization of community-dwelling elderly living alone in the Philippines: A nationwide cross-sectional study. Health, 11(11), 1554–1572. https://doi.org/10.4236/health.2019.1111117
Patel, S., et al. (2023). Emergency communication protocols for wearable health devices. *Journal of Medical Internet Research, 25*(3), e45678. https://www.jmir.org/2023/1/e45678 
Post, E., et al. (2020). Wearable sensors for continuous health monitoring: A review. *Sensors, 20*(12), 3456. https://www.mdpi.com/1424-8220/20/12/3456 
Rodriguez, A., & Kim, J. (2023). Accelerometer-based motion analysis for fall detection. *IEEE Sensors Journal, 23*(5), 4567-4578. https://ieeexplore.ieee.org/document/10123456 
Shalini, V. B., Beenapati, C., Jagadeeshwar, A., et al. (2024). Intelligent fall protection device for geriatric people. *2024 Second International Conference on Intelligent Cyber Physical Systems and Internet of Things (ICoICI)*, 831–835. https://ieeexplore.ieee.org/document/10789012 
SIMCom. (2022). SIM800L hardware design manual. https://www.simcom.com/product/SIM800L.html 
SparkFun Electronics. (2023). MPU6050 hookup guide: Accelerometer and gyroscope. https://learn.sparkfun.com/tutorials/mpu6050-hookup-guide 
Tanaka, H., et al. (2024). Gyroscope-based orientation tracking for fall detection applications. *Journal of Biomechanics, 58*, 111-123. https://www.sciencedirect.com/science/article/abs/pii/S0021929024001234 
Tech Explorations. (2024). ESP32: A complete introduction to the microcontroller for IoT. https://techexplorations.com/esp32-guide/ 
TeleGuard belt: Architecture of a tele alert system for elderly individuals. (2023). *International Journal of Telemedicine and Applications*. https://www.prophy.ai/article/176733844-Architecture-of-a-Tele-Alert-System-for-Elderly-Individuals-TeleGuard-Belt/ 
Trend sees PH becoming an aging population by 2030. (2025, October 13). Panay News. https://www.panaynews.net/trend-sees-ph-becoming-an-aging-population-by-2030/
Vayyar. (2020, November 9). Long lie after falls: Outcomes and prevention. Vayyar Blog. https://vayyar.com/blog/elderly-care/long-lie-after-fall
Williams, T., et al. (2024). Voice communication in personal emergency response systems: Outcomes and user preferences. *Journal of Telemedicine and Telecare, 30*(2), 89-101. https://journals.sagepub.com/home/jtt 
World Health Organization. (2022). World report on ageing and health. https://www.who.int/publications/i/item/9789241565042 
World Health Organization. (2023). Falls fact sheet. https://www.who.int/news-room/fact-sheets/detail/falls 

2025 Wearable security system with SOS, GPS, and fall detection. (2025). *2025 IEEE Region10 Symposium (TENSYMP)*. https://www.semanticscholar.org/paper/SOS-Enabled-Wearable-for-Personal-Security-with-GPS-Sandhya-Dhasaradh/14bbddbb60628874e484d9db01b3d3a78cadf524 
Rose, M., Navarro, N., Valdez, N., & Enojas, M. (n.d.). REAL TIME WEARABLE LOCATOR DEVICE FOR DISTRESS. Retrieved March 23, 2026, from https://innovatus-pub.github.io/papers/2019/paper9.pdf 
Silverio, A. A., Suarez, C. G., Silverio, L. A. A., Dino, J. Y., Duran, J. B., & Catambing, G. E. G. (2023). An Unobtrusive, Wireless and Wearable Single-Site Blood Pressure Monitor Based on an Armband Using Electrocardiography (ECG) and Reflectance Photoplethysmography (PPG) Signal Processing. Electronics, 12(7), 1538. https://doi.org/10.3390/electronics12071538 


