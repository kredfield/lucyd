## Designing a Recommendation Algorithm

### Objective

### Approach

#### Algorithm Design Framework
(Tim?)

#### Underlying Data Science Techniques

###### Kmeans & Latent Dirichlet Allocation 
In order to generate a few recommendations based on the tags that a user enters, we need to start somewhere! To do so, we look for all of the songs with the user's tags in the lucyd database and perform a kmeans on the result. We only calculate a single cluster because we attempt to find the song closest to the centroid of all of the songs that the query returns. But there are a lot of tags! Because the tags are stored in the form of a list of strings attached to each song, returning and operating on so many tags without tremendous lag on the front-end becomes tricky. Therefore, we use a dimensionality reduction technique called Latent Dirichlet Allocation.

Using Amazon Sagemaker, we converted the tags for each song into a TFIDF vector. We then converted the TFIDF vector into ten topic vectors using LDA. More information about LDA and the Sagemaker implementation can be found in the [AWS documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/lda.html). These pre-trained vectors are returned to the lambda function when a user requests a recommendation. The lambda functino then performs the kmeans as discussed above and sends out the Spotify URIs associated with those songs.

For more detail, please see the notebooks linked below:
  * [LDA Topic Vectorization](./LDA_Tag_Topic_Prediction.ipynb)
  * [Lambda Function for Kmeans]('./Single Song Recommendation.ipynb')
  
###### Cosine Similarity
Cosine similarity is a metric which uses the angle between two vectors projected in multi-dimensional space to measure the similarity between them. Often used to compare text corpora, we felt cosine similarity suited our purposes well given the nature of our input data. Mathematically, it measures the cosine of the angle between two vectors to determine their relative orientations; the smaller the angle, the higher the cosine similarity. Cosine similarity is especially neat and usful when used in the positive space which we are working with, where the outcome is neatly bounded in [0,1]. Here, vectors are maximally similar if they're parallel (i.e. two documents containing the exact same word distributions or two tag lists containing the exact same tags, regardless of order) and maximally dissimilar if they're perpindicular or orthogonal. 

Cosine similarity brings with it a couple of desirable properties for lucyd. First, its similarity metrics are independent of vector size. For our purposes, this means that the most popular songs (at least as defined by number of user-provided tags) in our dataset won't be determined to be more similar to each other solely because they have more tags in common. This is something that could not be achieved through a metric like Euclidean distance, which would likely inherently boost "popular" songs in our algorithm. The simplicity and interpretability of the cosine similarity calculations further drew us in this direction during our model selection process. One of lucyd's foundational ideas is avoiding black box models for our users. Cosine similarity allows us to understand exactly how our model is functioning under the hood. Finally, cosine similarity works well with numerous and sparsely populated features. We have hundreds of thousands of unique tags so this was a must for our platform.


# TO BE REMOVED: Reference from syllabus
We leave the detailed design of the project website to the team
due to the variety of projects. Sometimes a project will emphasize
interactive data visualizations of integrated data sources to
facilitate data exploration. In other cases, the emphasis of the
project is on machine learning, and will present the model in detail
and perhaps permit users to try the model out on their own data.
In all cases, the website demonstrates best efforts to make web
deliverable mission-driven, clear (in terms of communication),
clean, functional and well organized, and as a showcase for your
cumulative work. Ultimately, the web deliverable demonstrates
strong tactical and strategic thinking and implementation to lead
web site visitors and users to understand, appreciate, and engage
with your project and call-to-action.
