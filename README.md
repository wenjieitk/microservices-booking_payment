# microservices-booking_payment
- Do note that's 10s delay for status update {created -> awaiting payment}, {awaiting payment -> cancelled/confirmed}
- Reason of delay because you can see the changes of booking status within the time, you may open the json file while trigger the request
- The json data will be cleared everytime the app is started


## Run the app
#### Development
- `npm run dev` 
    - _Run both app with nodemon_
- `npm run dev:booking` or  `npm run dev:payment`
    - _Run single app with nodemon_
#### Production
- `npm run build-run` 
    - _Build both app and start both_


## Testing
- `npm test`


## DataStore
- You may open both the json file while you trigger the request, so you can see the changes within the file
#### Booking
- Booking status will update everytime get response from payment
- `location`  
    - _./booking.json_
- `model`  
    - _id: String_
    - _status: String_
#### Payment
- Will push new transaction on every request
- `location`  
    - _./payment.json_
- `model`  
    - _id: String_
    - _status: String_


## Flow and Logic
- Payment dataStore record every single transaction
#### Booking - assume user already login/verify and able to peform action below
- `Create` : create new booking
    - _Created_ -> _Awaiting Payment_ -> _Confirmed_ or _Cancelled_
- `Cancel` : cancel confirmed booking and request refund
    - _Created?id={id}_ -> _Confirmed_ -> _Refunded_
- `Check` : check single booking(with Id) or all booking(without Id)
    - _Check?id={id}_ -> _{id,status,[payment history]}_ or _[{id, status}]_
- `Retry` : re-booking cancelled booking (Must with Id)
    - _Retry?id={id}_ -> _Cancelled_ -> _Confirmed_ or _Cancelled_
#### Payment - need a dummy token _DummyTokenFromBooking_
- `Pay` : make payment for the booking
    - _Pay_ -> _Success_ or _Failed_
- `Refund` : make refund for the booking
    - _Refund_ -> _Refund_
- `Check` : get payment history for all booking(without Id) or payment history for single booking(with id)
    - _Check_ -> _[{id, status}]_
#### Booking Callback for Payment - callBack api for payment response
- `Payment` : callback for payment status
- `Refund` : callback for refund status


## API testing
- For easy testing, you may install vsCode plugin `REST Client` and find the file `api.rest` in project root folder, you can trigger the api from the file by single press `send request`