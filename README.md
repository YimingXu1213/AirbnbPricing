# Home.PI (MIT 6.S080 Final Project)
Hi there, this is the repository for Home.PI, A friendly Pricing Intelligence for Airbnb Hosts. 




## How to Run Our Code
Clone or download our [GitHub repository](https://github.com/YimingXu1213/AirbnbPricing.git) and navigate into this directory in your terminal.

Optional: create a virtual environment using `virtualenv`. This can be downloaded using `pip3` or `easy_install` as follows:

```
pip3 install virtualenv
```

or

```
sudo easy_install virtualenv
```

Then, create a virtual environment (using Python3), activate this virtual environment, and install the dependencies as follows:

```
virtualenv -p python3 my_env
source my_env/bin/activate
pip3 install -r requirements.txt
```

To run our code, navigate into the `webapp` folder unzip the 2 files in the command line:

```
unzip model/cleanData.csv.zip -d model
unzip model/rf.sav.zip -d model
```
After unzipping the files, initialize our webapp by using the following command:
```
python3 app.py
```

After the page has been completely initialized, the terminal will return the following line:

```
Serving on http://0.0.0.0:8080
```

Open a browser and enter http://0.0.0.0:8080. The page should be sucessfully displayed.


Finally, in order to deactivate the virtual environment, use the following command

```
deactivate
```

## Repo Structure
```
Model/                           
  data/
  ClassificationModel.ipynb
  EDA.ipynb
  midterm_EDA_baselineModel.ipynb
  
Reports/
  Midterm_Report.pdf
  Project_Proposal.pdf
  
webapp/
  app.py
  model/
    clean.Data.csv.zip/
    pythonFunctions.py
    rf.sav.zip
  static/
    css/
    data/
    fonts/
    image/
    img/
    js/
  templates/
    main.html                                      
    
README.md
requirements.txt

```
In Model folder, we have the notebooks including data preprocessing, EDA and modeling.</br>
In Reports folder, we have written reports including proposal and midterm.</br>
In webapp folder, which is also our final deliverable, we have the flask python file in app.py, page file in templates and other website support files in static and model. 
