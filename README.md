Avoiding the California DMV with NodeJS
====

The DMV needs no introduction; you don't need to be convinced that the DMV website is a hassle. This project exists because the DMV exists.

I developed this over the summer when trying to book an appointment at the DMV for someone. All appointments were booked 2-3 months in advance at my local DMV office, and I decided to do something about it.


Why use this?
---

1.  Multiple DMVs
    - You want to check schedules at multiple DMVs. The current system requires you to check each DMV individually in order to see the scheduled time there. To further exacerbate the problem, it's hard to know what DMVs are nearby.
    - This tool allows you to search all DMVs within a certain radius of your location.
2. Scheduling Queue
    - If you were to try to make a behind-the-wheel appointment at the DMV, they might schedule you a few months out. In reality, there may be appointments available sooner, but they are being held for other active viewers of the DMV website.
    - Similarly, sometimes people cancel appointments. This script will be able to detect these canceled appointments.
    - This tool will repeatedly poll the DMV website to try to snatch the earliest appointment. If an appointment is within a time range and day of week/month that you approve, then you will be sent a beep or a SMS.


What exactly does this do?
---
This script will find the nearest appointment for every CA DMV within a certain range of your home location. If there exists an appointment within an acceptable time-frame, you will receive a notification/text so you can grab that appointment.


Installation
---
First, clone this repository and install its dependencies

    git clone "https://github.com/vartan/ca-dmv-poller"
    cd ca-dmv-poller
    npm install

Next, modify the configuration file, `config.json`.

Now you're ready to go!

    node poll.js


How does it work?
---
* Finding all DMVS within a radius
    * First, I scraped a list of all of the DMV locations and their IDs from the DMV. I created a script to run them through google maps (concatenated with " DMV") and recorded their GPS coordinates.
    * When the script runs, it finds your GPS coordinates, and uses it to find all DMVs within N miles.
* Checking for appointments
    * I analyzed the POST data when submitting my information through the DMV and replicated it through node. The script just submits this POST data, and then parses the resulting web page using *cheerio*. The appointment time is checked against your preferences, and if necessary a notification is sent.
    * If texts are enabled, they are sent through *mtextbelt*.

Configuration
----
Here is the configuration file with annotations.

```javascript
{
    "behindTheWheelTest": true,
    "maxDistanceMiles":   30, // max distance from your home in miles
    "checkEveryMinutes":  1, // number of minutes between each search
    "secondsBetweenRequests": 1, // number of seconds between individual requests of a search
    "findAppointmentWithinDays": 14, // number of days out before notification
    "home":       "90731", // home zip code
    "textOnFind": false, // true if you want to receive a text message
    "textNumber": "3105555555", // number to text for notification
    "appointmentInfo": {
        "firstName":  "John",
        "lastName":   "Doe",
        "telArea":    "310",
        "telPrefix":  "555",
        "telSuffix":  "5555",

        //ONLY HAVE TO FILL BELOW FOR BEHIND THE WHEEL TEST, two digit day/month
        "dlNumber":   "",
        "birthMonth": "1",
        "birthDay":   "9",
        "birthYear":  "1991"
        // END BEHIND THE WHEEL TEST SECTION
    },
    "dayOfWeeks": [
        {
            "name":       "Sunday",
            "allowed":    false, // don't notify for Sunday appointments
            "startHour":  7, // 24 hour format
            "endHour":    17 // 24 hour format (5pm)

        },
        ...
        {
            "name":       "Saturday",
            "allowed":    true,
            "startHour":  7,
            "endHour":    17
        }
    ]
}

```

Caveats
----
As mentioned before, the DMV does hold appointments for users on the website. If the script finds an appointment and you can't book the appointment, try stopping the script and retrying until you can get it.
