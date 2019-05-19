# IMPORTS
import pandas as pd
import numpy as np

import tensorflow as tf
from tensorflow import keras
from keras.models import Sequential

from sklearn.model_selection import train_test_split

# LOAD DATA
data='allMatches.json'
df=pd.read_json(data)
#print(df)


# DATA HANDLING
df.radiant_win=df.radiant_win.astype(int) 
df=df.drop(columns=['duration','first_blood_time'])
players=df['players'].map(lambda x: list(map(lambda y: y['hero_id'],x))) #players
players=players.apply(pd.to_numeric)

# EMBEDDING
def embedding(players):
    hero_ids=np.zeros(117)
    for (index,id) in enumerate(players):
        if index<5:
            if id<=23:
                hero_ids[id-1]=1
            elif id<=114:
                hero_ids[id-2]=1
            elif id <=121:
                hero_ids[id-6]=1
            else:
                hero_ids[id-13]=1
        else:
            if id<=23:
                hero_ids[id-1]=-1
            elif id<=114:
                hero_ids[id-2]=-1
            elif id <=121:
                hero_ids[id-6]=-1
            else:
                hero_ids[id-13]=-1
    return pd.Series(hero_ids)

# APPLY EMBEDDING FOR HEROES 
players=players.apply(lambda x: embedding(x))

# DEFINE X & y
X=np.asarray(players)
y=np.asarray(df['radiant_win'])

DROPOUT_RATE=0.2

# NN MODEL
model=keras.Sequential([    
    keras.layers.Dense(200, input_dim=117, activation=tf.nn.relu), # 200 nodes
    keras.layers.Dropout(DROPOUT_RATE),
    keras.layers.Dense(200, activation=tf.nn.relu), # 200 nodes
    keras.layers.Dropout(DROPOUT_RATE),
    keras.layers.Dense(1, activation=tf.nn.sigmoid)
])

# COMPILATION
model.compile(optimizer='adam',loss='binary_crossentropy', metrics=['accuracy'])

# SPLIT DATA - label =X
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2, random_state=42)

# TRAIN
model.fit(X_train, y_train, epochs=50)

# EVALUATE
test_loss,test_acc=model.evaluate(X_test,y_test)
print('Test accuracy:', test_acc)

# PREDICTIONS

#predictions=model.predict(embedding([102,61,10,120,119,85,8,121,69,25]))
#print(predictions)