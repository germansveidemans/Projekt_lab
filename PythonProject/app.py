# # # from flask import Flask, redirect, url_for, render_template, request
# # #
# # # app = Flask(__name__)
# # #
# # #
# # # @app.route('/')
# # # def home():  # put application's code here
# # #     return render_template('home.html')
# # #
# # #
# # # @app.route('/orders')
# # # def order():
# # #     return render_template('orders.html', number_of_orders=3, orders=['121234', '345643563', '346345634r56'])
# # #
# # #
# # # @app.route('/orders/<orderid>')
# # # def order_by_id(orderid):
# # #     return render_template('order_details.html', order_id=orderid)
# # #
# # #
# # # @app.route('/<name>')
# # # def user(name):
# # #     return '<h1>Name is:' + name + '</h1>'
# # #
# # #
# # # @app.route('/admin')
# # # def admin():
# # #     # return redirect(url_for('hello_world'))
# # #     return redirect(url_for('user', name='Admin2'))
# # #
# # #
# # # @app.route('/login', methods=['GET', 'POST'])
# # # def login():
# # #     if request.method == 'POST':
# # #         username = request.form['email']
# # #         password = request.form['pwd']
# # #
# # #         if password != 'abc123':
# # #             return redirect(url_for('login'))
# # #
# # #         return render_template('profile.html', user=username)
# # #     else:
# # #         return render_template('login.html')
# # #
# # #
# # # @app.route('/profile')
# # # def profile():
# # #     return render_template('profile.html')
# # #
# # #
# # # if __name__ == '__main__':
# # #     app.run(host='127.0.0.1', port=8001, debug=True, use_reloader=False)
# #
# # from flask import Flask, jsonify
# # from flask_mysqldb import MySQL
# #
# # app = Flask(__name__)
# # app.config.update(
# #     MYSQL_HOST='projlab.mysql.database.azure.com',
# #     MYSQL_USER='Veideman',
# #     MYSQL_PASSWORD='AsdfgQwert!2345',
# #     MYSQL_DB='proj_lab',
# #     PORT = 3306
# # )
# # mysql = MySQL(app)
# #
# # @app.route('/data')
# # def data():
# #     cur = mysql.connection.cursor()
# #     cur.execute("SELECT * FROM users")
# #     rows = cur.fetchall()
# #     cur.close()
# #     return jsonify(rows)
# #
# # if __name__ == '__main__':
# #     app.run(host='127.0.0.1', port=8001, debug=True, use_reloader=False)
#
#
# from flask import Flask, jsonify
# import mysql.connector
#
# app = Flask(__name__)
#
# # Настройки подключения
# db_config = {
#     'host': 'projlab.mysql.database.azure.com',
#     'user': 'Veideman',
#     'password': 'AsdfgQwert!2345',
#     'database': 'proj_lab',
#     'port': 3306
# }
# @app.route('/tables')
# def list_tables():
#     try:
#         conn = mysql.connector.connect(**db_config)
#         cursor = conn.cursor()
#         cursor.execute("SHOW TABLES;")
#         tables = [row[0] for row in cursor.fetchall()]
#         return jsonify({"tables": tables})
#     except mysql.connector.Error as err:
#         return jsonify({"error": str(err)})
#     finally:
#         if 'cursor' in locals(): cursor.close()
#         if 'conn' in locals(): conn.close()
#
#
# @app.route('/')
# def index():
#     try:
#         conn = mysql.connector.connect(**db_config)
#         cursor = conn.cursor()
#         cursor.execute("SELECT NOW();")
#         result = cursor.fetchone()
#         return jsonify({
#             "message": "Connection successful!",
#             "server_time": result[0].strftime('%Y-%m-%d %H:%M:%S')
#         })
#     except mysql.connector.Error as err:
#         return jsonify({"error": str(err)})
#     finally:
#         if 'cursor' in locals(): cursor.close()
#         if 'conn' in locals(): conn.close()
#
# if __name__ == '__main__':
#     app.run(host='127.0.0.1', port=8001, debug=True, use_reloader=False)
