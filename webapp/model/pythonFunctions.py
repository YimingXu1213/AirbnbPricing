import pandas as pd
import numpy as np
import warnings
from datetime import datetime, timedelta
warnings.filterwarnings('ignore')

class createModel():
    def __init__(self, model, df_clean):
        self.model = model
        self.df = df_clean
        self.AMENITIES = ['Wifi', 'Heating', 'Smoke detector', 'Essentials', 'Kitchen', 
                          'Carbon monoxide detector', 'Hangers', 'Air conditioning', 'Shampoo', 'Hair dryer',
                          'Iron', 'Laptop friendly workspace', 'TV', 'Washer', 'Dryer', 
                          'Hot water','Fire extinguisher', 'Refrigerator', 'Microwave', 'Self check-in']
        self.testBase = self.testBaseInit(df_clean)
        self.testDict = self.testDictInit()        
    
    def testBaseInit(self, df_clean):
        # add categorical columns
        to_categorical = ['zipcode', 'property_type', 'room_type', 'bed_type', 'peak_month']
        list_zipcode = list(set(df_clean.zipcode.values[~df_clean.zipcode.isna()]))
        list_property_type = list(set(df_clean.property_type))
        list_room_type = list(set(df_clean.room_type))
        list_bed_type = list(set(df_clean.bed_type))
        list_peak_month = list(set(df_clean.peak_month))
        testBase = pd.MultiIndex.from_product([list_zipcode,list_property_type,list_room_type,list_bed_type, list_peak_month], 
                                              names=to_categorical)
        testBase = pd.DataFrame(index = testBase).reset_index()
        # add continous and binary columns
        # not_features = ['unavailable'] + to_categorical

        not_features = ['listing_id','date','dayWeek','month','host_since','city', 'year', 'day','unavailable'] + to_categorical
        contvar = df_clean.drop(not_features, axis = 1).columns
        for var in contvar: testBase[var] = 0
        # add empty row on top
        testBase.loc[-1] = 0
        testBase.index = testBase.index + 1  # shifting index
        testBase = testBase.sort_index()  # sorting by index
        # save
        return testBase
    
    def testDictInit(self):
        testDict = {'zipcode': '02138',
                    'property_type': 'Apartment',
                    'room_type': 'Entire home/apt',
                    'bed_type': 'Real Bed',
                    'accommodates': '2',
                    'guests_included': '2',
                    'extra_people': '0',
                    'bathrooms': '1',
                    'bedrooms': '1',
                    'beds': '1',
                    'security_deposit': '0',
                    'cleaning_fee': '75',
                    'weekend': '0',
                    'peak_month': 'Middle'}
        # amenities
        for a in self.AMENITIES: testDict[a] = '0'
        return testDict
    
    def classify_month(self,x):
        if x in [5,6,7,8,9,10]:
            return 'Peak'
        elif x in[3,4,11]:
            return 'Middle'
        else:
            return 'Slack'
    
    def read_inputDict(self, input_dict):
        # read input_dict
        for k, v in input_dict.items():
            if (len(v) != 0):
                if (k not in ['date_start','date_end','dynamic','prob_lower']) : self.testDict[k] = v
                elif k == 'dynamic': self.dynamic = int(v)
                elif k == 'prob_lower': self.prob_lower = float(v)
                elif k == 'date_start': self.date_start = v
                elif k == 'date_end': self.date_end = v
        # generate dates
        d = datetime.strptime(self.date_start, '%Y-%m-%d')
        d_end = datetime.strptime(self.date_end, '%Y-%m-%d')
        dates = [self.date_start]
        while d != d_end:
            d += timedelta(days=1)
            dates.append(datetime.strftime(d,'%Y-%m-%d'))
        self.dates = dates
        # generate peak_month and weekend
        self.date_properties = {}
        for d in dates:
            weekday = datetime.strptime(d, '%Y-%m-%d').strftime("%A")
            month = datetime.strptime(d, '%Y-%m-%d').month
            self.date_properties[d] = (self.classify_month(month), weekday in (['Friday', 'Saturday']))
    
    def dataProcessing(self, df_orig):
        df = df_orig.copy()
        df['zipcode'] = df['zipcode'].astype('category')
        to_categorical = ['zipcode', 'property_type', 'room_type', 'bed_type', 'peak_month']
        df = pd.concat([df, pd.get_dummies(df[to_categorical],
                                           prefix=['zipcode_', 'propertyType_', 'roomType_', 'bedType_', 'peakMonth_'], 
                                           drop_first=True)], axis = 1)
        # not_features = ['date','prob_lower'] + to_categorical
        df = df.drop(to_categorical, axis = 1)
        return df
    
    def get_range(self,testCase):    
        columns_needed = ['zipcode','property_type','room_type','bathrooms','bedrooms','beds',
                          'guests_included','weekend','peak_month']
        # standard 1
        index_Flag = True
        for i in columns_needed:
            index_Flag &= self.df[i] == self.testBase.loc[[0]][i].values[0]
        # standard 2
        if np.sum(index_Flag) < 10:
            self.df['zipcode_test'] = testCase['zipcode'].values[0]
            self.df['zipcode_diff'] = self.df['zipcode_test'] - self.df['zipcode']
            index_Flag = self.df['zipcode_diff'] <= 3
            for i in columns_needed[1:]:
                index_Flag &= self.df[i] == testCase[i].values[0]
            self.df = self.df.drop(['zipcode_test','zipcode_diff'], axis = 1)
        # standard 3
        if np.sum(index_Flag) < 10:
            index_Flag = True
            for i in columns_needed[1:-3]:
                index_Flag &= self.df[i] == testCase[i].values[0]
        lb,ub = np.quantile(self.df[index_Flag].price_daily, (0.05, 0.95))
        return lb,ub
    
    def get_prob(self, testCase_X, price):
        testCase_X['price_daily'] = price
        prob = self.model.predict_proba(testCase_X)[0][-1] # use the model here
        return prob
    
    def grid_search(self, testCase, cand_price, prob_lower):
        # calculate earning for each candidate price
        cand_prob = []
        cand_earning = []
        for p in cand_price:
            prob = self.get_prob(testCase, p)
            cand_prob.append(prob)
            cand_earning.append(p*prob)
        cand_prob, cand_earning = np.array(cand_prob), np.array(cand_earning)
        cand_price = cand_price[cand_prob >= self.prob_lower]
        cand_earning = cand_earning[cand_prob >= self.prob_lower]
        return cand_price, cand_prob[cand_prob >= self.prob_lower], cand_earning
        
    def optimization(self):
        # dynamic
        if self.dynamic == 1:
            prices,book_rates,earnings = {},{},{}
            for peak_month, weekend in set(self.date_properties.values()):
                # update date properties
                self.testBase.loc[0,'peak_month'] = peak_month
                self.testBase.loc[0,'weekend'] = weekend
                testCase_X = self.dataProcessing(self.testBase).loc[[0]]
                lb, ub = self.get_range(self.testBase.loc[[0]])
                # generate list of candidate prices
                if ub - lb <= 50: cand_price = np.arange(lb,ub+1,1)
                else: cand_price = np.round(np.linspace(lb,ub,50))
                # run grid search and filter by prob_lower
                cand_price, _, cand_earning = self.grid_search(testCase_X, cand_price, self.prob_lower)
                if len(cand_price) > 0:
                    prices[(peak_month,weekend)] = cand_price[np.argmax(cand_earning)]
                    earnings[(peak_month,weekend)] = np.max(cand_earning)
                else: # interpolate is self.prob_lower cannot be satisfied
                    interpolated_price = int(ub - (self.prob_lower - self.get_prob(testCase_X, lb))/0.01)
                    prices[(peak_month,weekend)] = interpolated_price
                    # interpolated_prob = self.get_prob(testCase_X, interpolated_price)
                    earnings[(peak_month,weekend)] = interpolated_price * self.prob_lower
            # process output
            price_suggestion = [prices[self.date_properties[d]] for d in self.dates]
            earning_suggestion = [earnings[self.date_properties[d]] for d in self.dates]
            final_pricing = pd.DataFrame([price_suggestion]).T
            final_pricing.columns = ['Suggested Price']
            final_pricing.index = self.dates
            final_earning = np.sum(earning_suggestion)
        # static
        elif self.dynamic == 0:
            # get max cand_price range
            for peak_month, weekend in set(self.date_properties.values()):
                lbs, ubs = [], []
                self.testBase.loc[0,'peak_month'] = peak_month
                self.testBase.loc[0,'weekend'] = weekend
                lb, ub = self.get_range(self.testBase.loc[[0]])
                lbs.append(lb)
                ubs.append(ub)
            lb = np.min(lbs)
            ub = np.max(ubs)
            # generate list of candidate prices
            if ub - lb <= 50: cand_price = np.arange(lb,ub+1,1)
            else: cand_price = np.round(np.linspace(lb,ub,50))
            # calculate matrix of earnings (n_date_properties * n_cand_price)
            dict_prob, dict_earning = {}, {}
            for peak_month, weekend in set(self.date_properties.values()):
                # update date properties
                self.testBase.loc[0,'peak_month'] = peak_month
                self.testBase.loc[0,'weekend'] = weekend
                testCase_X = self.dataProcessing(self.testBase).loc[[0]]
                # run grid search
                cand_price, cand_prob, cand_earning = self.grid_search(testCase_X, cand_price, 0)
                dict_prob[(peak_month,weekend)] = cand_prob
                dict_earning[(peak_month,weekend)] = cand_earning
            # process output
            matrix_prob = [dict_prob[self.date_properties[d]] for d in self.dates]
            matrix_earning = [dict_earning[self.date_properties[d]] for d in self.dates]
            if len(np.mean(matrix_prob,axis=0) >= self.prob_lower) > 0:
                final_earning = np.max(np.sum(matrix_earning,axis=0))
                price_suggestion = cand_price[np.argmax(np.sum(matrix_earning,axis=0))]
            else:
                price_suggestion = int(ub - (self.prob_lower - self.get_prob(testCase_X, lb))/0.01)
                final_earning = price_suggestion * self.prob_lower * len(self.dates)
            final_pricing = pd.DataFrame([price_suggestion]*len(self.dates))
            final_pricing.columns = ['Suggested Price']
            final_pricing.index = self.dates
        return final_earning, final_pricing
    
    def whole_process(self, input_dict):
        # reset hyperparameters
        self.prob_lower = 0
        self.dynamic = 1
        self.dates = {}
        self.date_start = '2019-11-01'
        self.date_end = '2019-11-07'
        # read input_dict
        self.read_inputDict(input_dict)
        for k,v in self.testDict.items():
            if k in ['zipcode','accommodates', 'guests_included', 'extra_people','bathrooms','bedrooms','beds','security_deposit','cleaning_fee']:
                self.testBase.loc[0, k] = float(v)
            else:
                self.testBase.loc[0,k] = v
        self.final_earning, self.final_pricing = self.optimization()
        return self.final_earning, self.final_pricing
    
    def recommend(self):
        cand = [a for a in self.AMENITIES if self.testDict[a] == '0']
        if len(cand) == 0:
            return ''
        else:
            earnings_change = []
            for a in cand:
                self.testBase.loc[0,a] = 1
                a_earning, a_pricing = self.optimization()
                earnings_change.append(a_earning - self.final_earning)
                self.testBase.loc[0,a] = 0

            idx_sort = np.argsort(earnings_change)[::-1]
            rec_amenity = []
            rec_earning = []
            for i in range(np.min([3, len(cand)])):
                if earnings_change[idx_sort[i]] > 0:
                    rec_amenity.append(cand[idx_sort[i]])
                    rec_earning.append(round(earnings_change[idx_sort[i]]/len(self.dates), 2))
                    print('You can make additional ${0:4.2f} daily on average if you install {1}.'.
                          format(rec_earning[i],rec_amenity[i]))
            return dict(zip(rec_amenity, rec_earning))
        
        
