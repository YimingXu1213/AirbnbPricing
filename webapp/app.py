import flask
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from model.pythonFunctions import createModel
import warnings
warnings.filterwarnings('ignore')

# app = flask.Flask(__name__, template_folder='templates')
app = flask.Flask(__name__)

# Use pickle to load in the pre-trained model.
with open(f'model/rf.sav', 'rb') as f:
    rf = pickle.load(f)

df_clean = pd.read_csv('model/cleanData.csv')
pi = createModel(rf, df_clean)
AMENITIES_LIST = ['Wifi', 'Heating', 'Smoke detector', 'Essentials', 'Kitchen', 
                          'Carbon monoxide detector', 'Hangers', 'Air conditioning', 'Shampoo', 'Hair dryer',
                          'Iron', 'Laptop friendly workspace', 'TV', 'Washer', 'Dryer', 
                          'Hot water','Fire extinguisher', 'Refrigerator', 'Microwave', 'Self check-in']


@app.route('/', methods=['GET', 'POST'])
def main():
    all_dict = {
        'date_start': '2019-11-07',
        'date_end': '2019-11-10',
        'zipcode': '02128',
        'accommodates': '1',
        'guests_included':'2',
        'extra_people': '0',
        'bathrooms': '1',
        'bedrooms': '1',
        'beds': '1',
        'security_deposit': '0',
        'cleaning_fee': '75',
        'prob_lower': '0'
    }
    

    if flask.request.method == 'POST':

        all_dict = flask.request.form.to_dict()
        # for i in AMENITIES_LIST:
        #     if flask.request.form.get(i) == '1':
        #         all_dict[i] = '1'
        #     else:
        #         all_dict[i] = '0'
        # return(flask.render_template('main.html', 
        # date_start = all_dict['date_start'], 
        # date_end = all_dict['date_end'],
        # zipcode = all_dict['zipcode'],
        # accommodates = all_dict['accommodates'],
        # guests_included = all_dict['guests_included'],
        # extra_people = all_dict['extra_people'],
        # bathrooms = all_dict['bathrooms'],
        # bedrooms = all_dict['bedrooms'],
        # beds = all_dict['beds'],
        # security_deposit = all_dict['security_deposit'],
        # cleaning_fee = all_dict['cleaning_fee'],
        # prob_lower = all_dict['prob_lower']))
        zipcode = float(all_dict['zipcode'])
        if zipcode not in sorted(df_clean.zipcode.unique()):
            diff_dict = dict(zip(abs(zipcode - df_clean.zipcode.unique()), df_clean.zipcode.unique()))
            near_dict_str = '0'+str(int(diff_dict[min(diff_dict)]))
            model_price = {'Zipcode Not Found': 'Your Zipcode ' + all_dict['zipcode'] + ' is not found. Why not try the neareast valid zipcode in our database: ' + near_dict_str + '.'}

            return(flask.render_template('main.html', 
            date_start = all_dict['date_start'], 
            date_end = all_dict['date_end'],
            zipcode = all_dict['zipcode'],
            accommodates = all_dict['accommodates'],
            guests_included = all_dict['guests_included'],
            extra_people = all_dict['extra_people'],
            bathrooms = all_dict['bathrooms'],
            bedrooms = all_dict['bedrooms'],
            beds = all_dict['beds'],
            security_deposit = all_dict['security_deposit'],
            cleaning_fee = all_dict['cleaning_fee'],
            prob_lower = all_dict['prob_lower'], price = model_price))
        

        elif datetime.strptime(all_dict['date_start'], '%Y-%m-%d') > datetime.strptime(all_dict['date_end'], '%Y-%m-%d'):
            model_price = {'Error': 'End Date should be no earlier than the Start Date'}

            return(flask.render_template('main.html', 
            date_start = all_dict['date_start'], 
            date_end = all_dict['date_end'],
            zipcode = all_dict['zipcode'],
            accommodates = all_dict['accommodates'],
            guests_included = all_dict['guests_included'],
            extra_people = all_dict['extra_people'],
            bathrooms = all_dict['bathrooms'],
            bedrooms = all_dict['bedrooms'],
            beds = all_dict['beds'],
            security_deposit = all_dict['security_deposit'],
            cleaning_fee = all_dict['cleaning_fee'],
            prob_lower = all_dict['prob_lower'], price = model_price))  
        else:          
            for i in AMENITIES_LIST:
                if flask.request.form.get(i) == '1':
                    all_dict[i] = '1'
                else:
                    all_dict[i] = '0'
        
            # print(all_dict)
            

            try:
                model_earning, model_price = pi.whole_process(all_dict)
                model_price = model_price.to_dict()['Price']
                model_recommend = pi.recommend()
                model_no_recommend = False
                
                if len(model_recommend) == 0:
                    model_no_recommend = True
                
                return(flask.render_template('main.html', 
                date_start = all_dict['date_start'], 
                date_end = all_dict['date_end'],
                zipcode = all_dict['zipcode'],
                accommodates = all_dict['accommodates'],
                guests_included = all_dict['guests_included'],
                extra_people = all_dict['extra_people'],
                bathrooms = all_dict['bathrooms'],
                bedrooms = all_dict['bedrooms'],
                beds = all_dict['beds'],
                security_deposit = all_dict['security_deposit'],
                cleaning_fee = all_dict['cleaning_fee'],
                prob_lower = all_dict['prob_lower'], price = model_price, earning = int(model_earning), recommend = model_recommend, no_recommend = model_no_recommend))

            except:
                model_price = {'Error': 'Please check all the inputs are valid'}
                return(flask.render_template('main.html', 
                date_start = all_dict['date_start'], 
                date_end = all_dict['date_end'],
                zipcode = all_dict['zipcode'],
                accommodates = all_dict['accommodates'],
                guests_included = all_dict['guests_included'],
                extra_people = all_dict['extra_people'],
                bathrooms = all_dict['bathrooms'],
                bedrooms = all_dict['bedrooms'],
                beds = all_dict['beds'],
                security_deposit = all_dict['security_deposit'],
                cleaning_fee = all_dict['cleaning_fee'],
                prob_lower = all_dict['prob_lower'], price = model_price))
        


    elif flask.request.method == 'GET':
        return(flask.render_template('main.html', 
        date_start = all_dict['date_start'], 
        date_end = all_dict['date_end'],
        zipcode = all_dict['zipcode'],
        accommodates = all_dict['accommodates'],
        guests_included = all_dict['guests_included'],
        extra_people = all_dict['extra_people'],
        bathrooms = all_dict['bathrooms'],
        bedrooms = all_dict['bedrooms'],
        beds = all_dict['beds'],
        security_deposit = all_dict['security_deposit'],
        cleaning_fee = all_dict['cleaning_fee'],
        prob_lower = all_dict['prob_lower']))


if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)
    app.run()